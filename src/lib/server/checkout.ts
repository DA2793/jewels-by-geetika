import { SupabaseClient } from "@supabase/supabase-js";
import { getProductById } from "@/data/products";
import { isExpressEligible } from "@/lib/express-pincodes";
import {
  sendOrderConfirmationEmail,
  sendAdminOrderNotification,
  OrderEmailItem,
} from "@/lib/server/emails";

// ── Types ──

export interface CheckoutItemInput {
  id: string;
  quantity: number;
}

export interface CustomerInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export interface PricedOrder {
  items: { productId: string; name: string; price: number; quantity: number }[];
  subtotal: number;
  discount: number;
  promoCode: string | null;
  shippingCost: number;
  codFee: number;
  total: number;
}

const COD_FEE = 99;
const COD_MAX_SUBTOTAL = 1999;
const EXPRESS_FEE = 99;
const MAX_QTY_PER_ITEM = 10;

// ── Pricing (server-side source of truth) ──

export function priceItems(
  itemsInput: CheckoutItemInput[]
): { ok: true; items: PricedOrder["items"]; subtotal: number } | { ok: false; error: string } {
  if (!Array.isArray(itemsInput) || itemsInput.length === 0) {
    return { ok: false, error: "Your bag is empty" };
  }

  const items: PricedOrder["items"] = [];
  for (const input of itemsInput) {
    const quantity = Number(input?.quantity);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QTY_PER_ITEM) {
      return { ok: false, error: "Invalid item quantity" };
    }
    const product = getProductById(String(input?.id));
    if (!product) {
      return { ok: false, error: "One of the items in your bag is no longer available" };
    }
    items.push({ productId: product.id, name: product.name, price: product.price, quantity });
  }

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  return { ok: true, items, subtotal };
}

export function computeShipping(subtotal: number, expressShipping: boolean, pincode: string): number {
  const base = subtotal > 999 ? 0 : subtotal >= 799 ? 49 : 79;
  const express = expressShipping && isExpressEligible(pincode) ? EXPRESS_FEE : 0;
  return base + express;
}

// ── Promo validation (server-side) ──

export async function validatePromoServer(
  admin: SupabaseClient,
  code: string,
  subtotal: number,
  userId: string | null
): Promise<{ valid: boolean; error?: string; discount: number }> {
  const { data: promo, error } = await admin
    .from("promo_codes")
    .select("*")
    .eq("code", code.trim().toUpperCase())
    .eq("active", true)
    .single();

  if (error || !promo) {
    return { valid: false, error: "Invalid promo code", discount: 0 };
  }

  if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
    return { valid: false, error: "This promo code has expired", discount: 0 };
  }

  if (promo.max_uses && promo.used_count >= promo.max_uses) {
    return { valid: false, error: "This promo code has reached its usage limit", discount: 0 };
  }

  if (promo.first_time_only) {
    if (!userId) {
      return { valid: false, error: "This code is only valid for first-time orders", discount: 0 };
    }
    const { count } = await admin
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);
    if ((count ?? 0) > 0) {
      return { valid: false, error: "This code is only valid for first-time orders", discount: 0 };
    }
  }

  if (promo.min_order && subtotal < promo.min_order) {
    return { valid: false, error: `Promo code valid on orders above ₹${promo.min_order}`, discount: 0 };
  }

  let discount = 0;
  if (promo.type === "percentage") {
    discount = Math.ceil((subtotal * promo.value) / 100);
    if (promo.max_discount && discount > promo.max_discount) {
      discount = promo.max_discount;
    }
  } else if (promo.type === "price_to") {
    if (subtotal <= promo.value) {
      return { valid: false, error: `This code applies on orders above ₹${promo.value}`, discount: 0 };
    }
    discount = subtotal - promo.value;
  } else {
    discount = Math.min(promo.value, subtotal);
  }

  return { valid: true, discount };
}

// ── Full order pricing ──

export async function priceOrder(
  admin: SupabaseClient,
  input: {
    items: CheckoutItemInput[];
    promoCode?: string | null;
    expressShipping?: boolean;
    paymentMethod: "prepaid" | "cod";
    pincode: string;
    userId: string | null;
  }
): Promise<{ ok: true; order: PricedOrder } | { ok: false; error: string }> {
  const priced = priceItems(input.items);
  if (!priced.ok) return priced;

  let discount = 0;
  let promoCode: string | null = null;
  if (input.promoCode) {
    const promoResult = await validatePromoServer(admin, input.promoCode, priced.subtotal, input.userId);
    if (!promoResult.valid) {
      return { ok: false, error: promoResult.error || "Invalid promo code" };
    }
    discount = promoResult.discount;
    promoCode = input.promoCode.trim().toUpperCase();
  }

  if (input.paymentMethod === "cod" && priced.subtotal > COD_MAX_SUBTOTAL) {
    return { ok: false, error: "Cash on Delivery is not available for this order value" };
  }

  const shippingCost = computeShipping(priced.subtotal, !!input.expressShipping, input.pincode);
  const codFee = input.paymentMethod === "cod" ? COD_FEE : 0;
  const total = priced.subtotal - discount + shippingCost + codFee;

  return {
    ok: true,
    order: { items: priced.items, subtotal: priced.subtotal, discount, promoCode, shippingCost, codFee, total },
  };
}

// ── Stock (server-side, errors checked) ──

export async function validateStockServer(
  admin: SupabaseClient,
  items: PricedOrder["items"]
): Promise<{ valid: boolean; error?: string }> {
  for (const item of items) {
    const { data, error } = await admin
      .from("stock")
      .select("quantity")
      .eq("product_id", item.productId)
      .single();

    if (error) {
      console.error("Stock check failed:", error);
      return { valid: false, error: "Could not verify stock. Please try again." };
    }
    if ((data?.quantity ?? 0) < item.quantity) {
      return {
        valid: false,
        error: `${item.name} only has ${data?.quantity ?? 0} piece(s) available. Please update your cart.`,
      };
    }
  }
  return { valid: true };
}

export async function decrementStockServer(
  admin: SupabaseClient,
  items: PricedOrder["items"]
): Promise<{ success: boolean; warnings: string[] }> {
  const warnings: string[] = [];
  for (const item of items) {
    const { data, error } = await admin.rpc("decrement_stock", {
      p_product_id: item.productId,
      p_quantity: item.quantity,
    });
    if (error || data === false) {
      console.error("Stock decrement failed:", item.productId, error);
      warnings.push(`Stock decrement failed for ${item.name} (id ${item.productId}) — verify inventory manually.`);
    }
  }
  return { success: warnings.length === 0, warnings };
}

// ── Finalization ──
// Marks a pending (prepaid) order as paid, decrements stock, sends emails,
// bumps promo usage. Idempotent: only the caller that flips payment_status
// from 'created' to 'paid' performs side effects (webhook + verify can race safely).

export async function finalizePrepaidOrder(
  admin: SupabaseClient,
  razorpayOrderId: string,
  razorpayPaymentId: string
): Promise<{ ok: boolean; orderId?: string; alreadyFinalized?: boolean; error?: string }> {
  const { data: updated, error } = await admin
    .from("orders")
    .update({ payment_status: "paid", status: "confirmed", payment_id: razorpayPaymentId })
    .eq("razorpay_order_id", razorpayOrderId)
    .eq("payment_status", "created")
    .select("*");

  if (error) {
    console.error("Order finalization update failed:", error);
    return { ok: false, error: "Could not finalize order" };
  }

  if (!updated || updated.length === 0) {
    // Either already finalized (webhook/verify race — fine) or unknown order id
    const { data: existing } = await admin
      .from("orders")
      .select("id, payment_status")
      .eq("razorpay_order_id", razorpayOrderId)
      .single();
    if (existing && existing.payment_status === "paid") {
      return { ok: true, orderId: existing.id, alreadyFinalized: true };
    }
    return { ok: false, error: "Order not found" };
  }

  const order = updated[0];
  await runPostOrderSideEffects(admin, order);
  return { ok: true, orderId: order.id };
}

// Shared side effects for a confirmed order row (COD insert or finalized prepaid)
export async function runPostOrderSideEffects(admin: SupabaseClient, order: any): Promise<void> {
  const items: OrderEmailItem[] = (order.items || []).map((i: any) => ({
    name: i.name,
    quantity: i.quantity,
    price: i.price,
  }));
  const pricedItems = (order.items || []).map((i: any) => ({
    productId: i.product_id ?? i.productId ?? "",
    name: i.name,
    price: i.price,
    quantity: i.quantity,
  }));

  // 1. Decrement stock (errors collected, surfaced to admin email)
  const { warnings } = await decrementStockServer(admin, pricedItems);

  // 2. Increment promo usage
  if (order.promo_code) {
    const { error } = await admin.rpc("increment_promo_usage", { p_code: order.promo_code });
    if (error) console.error("Promo usage increment failed:", error);
  }

  // 3. Admin notification
  try {
    await sendAdminOrderNotification({
      payment_id: order.payment_id,
      payment_method: order.payment_method || "prepaid",
      total: order.total,
      shipping_cost: order.shipping_cost,
      shipping_name: order.shipping_name,
      shipping_email: order.shipping_email,
      shipping_phone: order.shipping_phone,
      shipping_address: order.shipping_address,
      shipping_city: order.shipping_city,
      shipping_state: order.shipping_state,
      shipping_pincode: order.shipping_pincode,
      items,
      warnings,
    });
  } catch (e) {
    console.error("Admin notification failed:", e);
  }

  // 4. Customer confirmation
  if (order.shipping_email) {
    try {
      await sendOrderConfirmationEmail({
        email: order.shipping_email,
        name: (order.shipping_name || "").split(" ")[0],
        orderId: order.id,
        invoiceUrl: `https://www.jewelsbygeetika.com/invoice/${order.id}`,
        total: order.total,
        shippingCost: order.shipping_cost,
        paymentMethod: order.payment_method || "prepaid",
        items,
      });
    } catch (e) {
      console.error("Order confirmation email failed:", e);
    }
  }
}
