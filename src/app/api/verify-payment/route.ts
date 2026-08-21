import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminClient } from "@/lib/server/supabase-admin";
import { finalizePrepaidOrder } from "@/lib/server/checkout";

export const dynamic = "force-dynamic";

function safeEqualHex(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export async function POST(request: NextRequest) {
  try {
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      console.error("RAZORPAY_KEY_SECRET not configured");
      return NextResponse.json({ error: "Payment gateway not configured" }, { status: 500 });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json();
    if (
      typeof razorpay_order_id !== "string" ||
      typeof razorpay_payment_id !== "string" ||
      typeof razorpay_signature !== "string"
    ) {
      return NextResponse.json({ verified: false, error: "Invalid request" }, { status: 400 });
    }

    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (!safeEqualHex(expectedSignature, razorpay_signature)) {
      return NextResponse.json(
        { verified: false, error: "Payment verification failed" },
        { status: 400 }
      );
    }

    // Signature valid — finalize the order server-side (idempotent; webhook may race)
    const admin = createAdminClient();
    if (!admin) {
      console.error("SUPABASE_SERVICE_ROLE_KEY not configured");
      // Payment is real; the webhook will finalize. Don't fail the customer.
      return NextResponse.json({ verified: true, orderId: null });
    }

    const result = await finalizePrepaidOrder(admin, razorpay_order_id, razorpay_payment_id);
    if (!result.ok) {
      console.error("Finalization failed after valid payment:", result.error);
      // Payment succeeded; webhook is the safety net. Report verified anyway.
      return NextResponse.json({ verified: true, orderId: null });
    }

    return NextResponse.json({ verified: true, orderId: result.orderId });
  } catch (error) {
    console.error("verify-payment error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
