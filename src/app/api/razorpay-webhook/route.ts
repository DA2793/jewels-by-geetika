import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminClient } from "@/lib/server/supabase-admin";
import { finalizePrepaidOrder } from "@/lib/server/checkout";

export const dynamic = "force-dynamic";

// Razorpay webhook — safety net that finalizes paid orders even if the
// customer's browser dies before /api/verify-payment runs.
// Configure in Razorpay Dashboard → Webhooks → event "payment.captured",
// URL https://www.jewelsbygeetika.com/api/razorpay-webhook,
// secret must match RAZORPAY_WEBHOOK_SECRET.
export async function POST(request: NextRequest) {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("RAZORPAY_WEBHOOK_SECRET not configured");
      return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
    }

    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature") || "";

    const expected = crypto.createHmac("sha256", webhookSecret).update(rawBody).digest("hex");
    const sigBuf = Buffer.from(signature, "utf8");
    const expBuf = Buffer.from(expected, "utf8");
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    if (event?.event !== "payment.captured") {
      return NextResponse.json({ received: true });
    }

    const payment = event?.payload?.payment?.entity;
    const razorpayOrderId = payment?.order_id;
    const razorpayPaymentId = payment?.id;
    if (!razorpayOrderId || !razorpayPaymentId) {
      return NextResponse.json({ received: true });
    }

    const admin = createAdminClient();
    if (!admin) {
      console.error("SUPABASE_SERVICE_ROLE_KEY not configured");
      return NextResponse.json({ error: "Not configured" }, { status: 500 });
    }

    const result = await finalizePrepaidOrder(admin, razorpayOrderId, razorpayPaymentId);
    if (!result.ok) {
      // Unknown order — log for manual review, but ack so Razorpay stops retrying
      console.error("Webhook finalization failed:", razorpayOrderId, result.error);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("razorpay-webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
