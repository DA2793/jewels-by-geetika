import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/server/supabase-admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { priceItems, validatePromoServer, CheckoutItemInput } from "@/lib/server/checkout";

export const dynamic = "force-dynamic";

// Validates a promo code against the user's actual cart (UI preview).
// The discount is recomputed authoritatively again at order creation.
export async function POST(request: NextRequest) {
  try {
    const admin = createAdminClient();
    if (!admin) {
      return NextResponse.json({ valid: false, error: "System error" }, { status: 500 });
    }

    const supabase = createServerSupabaseClient();
    const { data: userData } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
    const user = userData?.user;
    if (!user) {
      return NextResponse.json({ valid: false, error: "Please log in first" }, { status: 401 });
    }

    const body = await request.json();
    const code = typeof body?.code === "string" ? body.code : "";
    const items: CheckoutItemInput[] = body?.items;
    if (!code.trim()) {
      return NextResponse.json({ valid: false, error: "Enter a promo code" }, { status: 400 });
    }

    const priced = priceItems(items);
    if (!priced.ok) {
      return NextResponse.json({ valid: false, error: priced.error }, { status: 400 });
    }

    const result = await validatePromoServer(admin, code, priced.subtotal, user.id);
    if (!result.valid) {
      return NextResponse.json({ valid: false, error: result.error });
    }

    return NextResponse.json({ valid: true, discount: result.discount });
  } catch (error) {
    console.error("validate-promo error:", error);
    return NextResponse.json({ valid: false, error: "Could not validate code" }, { status: 500 });
  }
}
