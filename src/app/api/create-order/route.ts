import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { createAdminClient } from "@/lib/server/supabase-admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  priceOrder,
  validateStockServer,
  runPostOrderSideEffects,
  CheckoutItemInput,
  CustomerInput,
} from "@/lib/server/checkout";

export const dynamic = "force-dynamic";

function sanitizeCustomer(raw: any): CustomerInput | null {
  const fields = ["firstName", "lastName", "email", "phone", "address", "city", "state", "pincode"] as const;
  const customer = {} as CustomerInput;
  for (const f of fields) {
    const value = typeof raw?.[f] === "string" ? raw[f].trim() : "";
    if (!value && f !== "email") return null; // email optional, rest required
    if (value.length > 500) return null;
    customer[f] = value;
  }
  return customer;
}

export async function POST(request: NextRequest) {
  try {
    const admin = createAdminClient();
    if (!admin) {
      console.error("SUPABASE_SERVICE_ROLE_KEY not configured");
      return NextResponse.json({ error: "Checkout is temporarily unavailable" }, { status: 500 });
    }

    // Require a logged-in user (session cookie)
    const supabase = createServerSupabaseClient();
    const { data: userData } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
    const user = userData?.user;
    if (!user) {
      return NextResponse.json({ error: "Please log in to place an order" }, { status: 401 });
    }

    const body = await request.json();
    const items: CheckoutItemInput[] = body?.items;
    const paymentMethod = body?.paymentMethod === "cod" ? "cod" : "prepaid";
    const customer = sanitizeCustomer(body?.customer);
    if (!customer) {
      return NextResponse.json({ error: "Please fill in all shipping details" }, { status: 400 });
    }

    // Server-side pricing — client-sent amounts are never trusted
    const priced = await priceOrder(admin, {
      items,
      promoCode: typeof body?.promoCode === "string" ? body.promoCode : null,
      expressShipping: !!body?.expressShipping,
      paymentMethod,
      pincode: customer.pincode,
      userId: user.id,
    });
    if (!priced.ok) {
      return NextResponse.json({ error: priced.error }, { status: 400 });
    }
    const order = priced.order;

    const stockCheck = await validateStockServer(admin, order.items);
    if (!stockCheck.valid) {
      return NextResponse.json({ error: stockCheck.error }, { status: 409 });
    }

    const orderRow = {
      user_id: user.id,
      total: order.total,
      shipping_cost: order.shippingCost,
      discount: order.discount || null,
      promo_code: order.promoCode,
      shipping_name: `${customer.firstName} ${customer.lastName}`,
      shipping_email: customer.email,
      shipping_phone: customer.phone,
      shipping_address: customer.address,
      shipping_city: customer.city,
      shipping_state: customer.state,
      shipping_pincode: customer.pincode,
      items: order.items.map((i) => ({
        product_id: i.productId,
        name: i.name,
        quantity: i.quantity,
        price: i.price,
      })),
    };

    // ── COD: finalize immediately ──
    if (paymentMethod === "cod") {
      const { data: inserted, error } = await admin
        .from("orders")
        .insert({
          ...orderRow,
          status: "confirmed",
          payment_method: "cod",
          payment_status: "pending",
          cod_fee: order.codFee,
          payment_id: `cod_${Date.now()}`,
        })
        .select("*")
        .single();

      if (error || !inserted) {
        console.error("COD order insert failed:", error);
        return NextResponse.json({ error: "Could not place order. Please try again." }, { status: 500 });
      }

      await runPostOrderSideEffects(admin, inserted);
      return NextResponse.json({ paymentMethod: "cod", orderId: inserted.id, total: order.total });
    }

    // ── Prepaid: create Razorpay order + pending DB row ──
    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      console.error("Razorpay keys not configured");
      return NextResponse.json({ error: "Payment gateway not configured" }, { status: 500 });
    }

    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const rzpOrder = await razorpay.orders.create({
      amount: Math.round(order.total * 100), // paise
      currency: "INR",
      receipt: `jbg_${Date.now()}`,
    });

    const { error: insertError } = await admin.from("orders").insert({
      ...orderRow,
      status: "pending",
      payment_method: "prepaid",
      payment_status: "created",
      payment_id: rzpOrder.id,
      razorpay_order_id: rzpOrder.id,
    });

    if (insertError) {
      console.error("Pending order insert failed:", insertError);
      return NextResponse.json({ error: "Could not place order. Please try again." }, { status: 500 });
    }

    return NextResponse.json({
      paymentMethod: "prepaid",
      razorpayOrderId: rzpOrder.id,
      amountPaise: rzpOrder.amount,
      currency: rzpOrder.currency,
      total: order.total,
    });
  } catch (error) {
    console.error("create-order error:", error);
    return NextResponse.json({ error: "Could not start checkout. Please try again." }, { status: 500 });
  }
}
