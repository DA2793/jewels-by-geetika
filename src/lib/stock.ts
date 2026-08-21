import { createClient } from "@/lib/supabase/client";

// Client-side stock reads (display only — checkout re-validates on the server).

export async function getStock(productId: string): Promise<number> {
  const supabase = createClient();
  if (!supabase) return 0;

  const { data, error } = await supabase
    .from("stock")
    .select("quantity")
    .eq("product_id", productId)
    .single();

  if (error) console.error("Stock fetch failed:", error.message);
  return data?.quantity ?? 0;
}

export async function getAllStock(): Promise<Record<string, number>> {
  const supabase = createClient();
  if (!supabase) return {};

  const { data, error } = await supabase.from("stock").select("product_id, quantity");

  if (error) {
    console.error("Stock fetch failed:", error.message);
    return {};
  }
  if (!data) return {};

  const stockMap: Record<string, number> = {};
  data.forEach((item: { product_id: string; quantity: number }) => {
    stockMap[item.product_id] = item.quantity;
  });
  return stockMap;
}

// NOTE: The two functions below are used by the current client-side checkout
// and will be removed when the server-side checkout (feature branch) merges.

export async function decrementStock(
  items: { productId: string; quantity: number }[]
): Promise<{ success: boolean; failedProduct?: string }> {
  const supabase = createClient();
  if (!supabase) return { success: false, failedProduct: "System error" };

  for (const item of items) {
    const { data, error } = await supabase.rpc("decrement_stock", {
      p_product_id: item.productId,
      p_quantity: item.quantity,
    });

    if (error) console.error("Stock decrement failed:", error.message);
    if (error || !data) {
      return { success: false, failedProduct: item.productId };
    }
  }

  return { success: true };
}

export async function validateStock(
  items: { productId: string; quantity: number }[]
): Promise<{ valid: boolean; insufficientProduct?: string; available?: number }> {
  const supabase = createClient();
  if (!supabase) return { valid: false };

  for (const item of items) {
    const { data, error } = await supabase
      .from("stock")
      .select("quantity")
      .eq("product_id", item.productId)
      .single();

    if (error) console.error("Stock check failed:", error.message);
    const available = data?.quantity ?? 0;
    if (available < item.quantity) {
      return { valid: false, insufficientProduct: item.productId, available };
    }
  }

  return { valid: true };
}
