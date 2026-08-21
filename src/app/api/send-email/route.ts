import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ADMIN_EMAILS } from "@/lib/admin-emails";
import { sendWelcomeEmail, sendOrderShippedEmail } from "@/lib/server/emails";

export const dynamic = "force-dynamic";

// Remaining public email surface:
// - "welcome": requires a logged-in session; sent to the session's own email only.
// - "order-shipped": admin-only (used by the admin dashboard).
// Order confirmations & admin notifications are sent server-side during
// order finalization and are no longer reachable from this endpoint.
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: userData } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
    const user = userData?.user;
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { type, data } = await request.json();

    if (type === "welcome") {
      // Only allow sending to the authenticated user's own address
      if (!user.email) {
        return NextResponse.json({ error: "No email on account" }, { status: 400 });
      }
      await sendWelcomeEmail({
        name: typeof data?.name === "string" ? data.name.slice(0, 100) : "",
        email: user.email,
      });
      return NextResponse.json({ success: true });
    }

    if (type === "order-shipped") {
      if (!ADMIN_EMAILS.includes(user.email || "")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
      const { email, name, orderId, trackingNumber, courierPartner, items } = data || {};
      if (!email || !orderId) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
      }
      await sendOrderShippedEmail({
        email,
        name: name || "",
        orderId,
        trackingNumber: trackingNumber || "",
        courierPartner: courierPartner || "",
        items: Array.isArray(items) ? items : [],
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid email type" }, { status: 400 });
  } catch (error) {
    console.error("send-email error:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
