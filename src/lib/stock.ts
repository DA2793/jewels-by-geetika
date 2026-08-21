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

