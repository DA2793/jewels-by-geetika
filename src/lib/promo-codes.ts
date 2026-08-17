import { createClient } from "@/lib/supabase/client";

export interface PromoCode {
  id: string;
  code: string;
  type: "percentage" | "flat" | "price_to";
  value: number;
  min_order: number;
  max_discount: number | null;
  first_time_only: boolean;
  max_uses: number | null;
  used_count: number;
  expires_at: string | null;
  active: boolean;
}

export async function validatePromoCode(
  code: string,
  orderTotal: number,
  hasOrderHistory: boolean
): Promise<{ valid: boolean; error?: string; discount?: number; promoCode?: PromoCode }> {
  const supabase = createClient();
  if (!supabase) return { valid: false, error: "System error" };

  const { data: promo } = await supabase
    .from("promo_codes")
    .select("*")
    .eq("code", code.trim().toUpperCase())
    .eq("active", true)
    .single();

  if (!promo) {
    return { valid: false, error: "Invalid promo code" };
  }

  // Check expiry
  if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
    return { valid: false, error: "This promo code has expired" };
  }

  // Check usage limit
  if (promo.max_uses && promo.used_count >= promo.max_uses) {
    return { valid: false, error: "This promo code has reached its usage limit" };
  }

  // Check first-time only
  if (promo.first_time_only && hasOrderHistory) {
    return { valid: false, error: "This code is only valid for first-time orders" };
  }

  // Check minimum order
  if (promo.min_order && orderTotal < promo.min_order) {
    return { valid: false, error: "Promo code valid on orders above ₹999" };
  }

  // Calculate discount
  let discount = 0;
  if (promo.type === "percentage") {
    discount = Math.ceil((orderTotal * promo.value) / 100);
    if (promo.max_discount && discount > promo.max_discount) {
      discount = promo.max_discount;
    }
  } else if (promo.type === "price_to") {
    // Sets the order subtotal to a fixed price (e.g., FLAT999 → pay ₹999)
    if (orderTotal <= promo.value) {
      return { valid: false, error: `This code applies on orders above ₹${promo.value}` };
    }
    discount = orderTotal - promo.value;
  } else {
    discount = promo.value;
  }

  return { valid: true, discount, promoCode: promo };
}

export async function incrementPromoUsage(code: string): Promise<void> {
  const supabase = createClient();
  if (!supabase) return;

  await supabase.rpc("increment_promo_usage", { p_code: code.trim().toUpperCase() });
}
