import { Resend } from "resend";
import { ADMIN_EMAILS } from "@/lib/admin-emails";

// ── Helpers ──

export function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getResend(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY not configured — email skipped");
    return null;
  }
  return new Resend(apiKey);
}

export interface OrderEmailItem {
  name: string;
  quantity: number;
  price: number;
}

// ── Senders (server-side only, fire-and-forget safe) ──

export async function sendWelcomeEmail(data: { name: string; email: string }): Promise<void> {
  const resend = getResend();
  if (!resend) return;
  const name = escapeHtml(data.name);

  await resend.emails.send({
    from: "Jewels by Geetika <hello@jewelsbygeetika.com>",
    to: data.email,
    replyTo: "contact@jewelsbygeetika.com",
    subject: "Welcome to Jewels by Geetika",
    html: `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #FDFCFA; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #111; font-size: 24px; margin: 0;">Welcome to Jewels by Geetika</h1>
          <p style="color: #C8A84B; font-size: 13px; letter-spacing: 2px; margin-top: 4px;">PREMIUM HAND-CURATED JEWELLERY</p>
        </div>
        <p style="color: #252525; font-size: 15px; line-height: 1.7;">Hi${name ? ` ${name}` : ""},</p>
        <p style="color: #252525; font-size: 15px; line-height: 1.7;">
          Thank you for joining us. We're thrilled to have you as part of the Jewels by Geetika family.
        </p>
        <p style="color: #252525; font-size: 15px; line-height: 1.7;">
          Every piece in our collection is thoughtfully curated with love — designed to make you feel extraordinary. From regal kundan sets to modern statement rings, there's something waiting just for you.
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="https://www.jewelsbygeetika.com/collections" style="display: inline-block; padding: 14px 32px; background: #111; color: #fff; text-decoration: none; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; border-radius: 50px;">
            Explore Collections
          </a>
        </div>
        <p style="color: #252525; font-size: 15px; line-height: 1.7;">
          With love,<br>
          <span style="color: #C8A84B; font-style: italic;">Jewels by Geetika</span>
        </p>
        <div style="border-top: 1px solid #E8D9C5; margin-top: 32px; padding-top: 16px; text-align: center;">
          <p style="color: #787878; font-size: 11px; margin: 0;">
            <a href="https://www.jewelsbygeetika.com" style="color: #C8A84B; text-decoration: none;">www.jewelsbygeetika.com</a> ·
            <a href="https://www.instagram.com/jewelsbygeetika/" style="color: #C8A84B; text-decoration: none;">@jewelsbygeetika</a>
          </p>
        </div>
      </div>
    `,
  });
}

export async function sendOrderConfirmationEmail(data: {
  email: string;
  name: string;
  orderId: string;
  invoiceUrl?: string;
  total: number;
  shippingCost: number;
  paymentMethod: string;
  items: OrderEmailItem[];
}): Promise<void> {
  const resend = getResend();
  if (!resend) return;

  const itemsHtml = data.items
    .map(
      (item) =>
        `<tr><td style="padding: 8px 0; color: #252525; font-size: 14px;">${escapeHtml(item.name)} × ${Number(item.quantity)}</td><td style="padding: 8px 0; color: #252525; font-size: 14px; text-align: right;">₹${(item.price * item.quantity).toLocaleString("en-IN")}</td></tr>`
    )
    .join("");

  const paymentLabel = data.paymentMethod === "cod" ? "Cash on Delivery" : "Paid Online";
  const shortId = escapeHtml(data.orderId.slice(0, 8));

  await resend.emails.send({
    from: "Jewels by Geetika <orderconfirmation@jewelsbygeetika.com>",
    to: data.email,
    replyTo: "contact@jewelsbygeetika.com",
    subject: `Order Confirmed — Jewels by Geetika #${data.orderId.slice(0, 8)}`,
    html: `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #FDFCFA; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #111; font-size: 22px; margin: 0;">Order Confirmed! 🎉</h1>
          <p style="color: #3A3A3A; font-size: 14px; margin-top: 8px;">Thank you for your order, ${escapeHtml(data.name)}.</p>
        </div>
        <div style="background: white; border: 1px solid #E8D9C5; border-radius: 8px; padding: 20px; margin-bottom: 16px;">
          <p style="color: #787878; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 12px;">Order Details</p>
          <p style="color: #252525; font-size: 13px; margin: 4px 0;"><strong>Order ID:</strong> #${shortId}</p>
          <p style="color: #252525; font-size: 13px; margin: 4px 0;"><strong>Payment:</strong> ${paymentLabel}</p>
        </div>
        <div style="background: white; border: 1px solid #E8D9C5; border-radius: 8px; padding: 20px; margin-bottom: 16px;">
          <p style="color: #787878; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 12px;">Items</p>
          <table style="width: 100%; border-collapse: collapse;">${itemsHtml}</table>
          <div style="border-top: 1px solid #E8D9C5; margin-top: 12px; padding-top: 12px;">
            <table style="width: 100%;">
              <tr><td style="color: #3A3A3A; font-size: 13px;">Shipping</td><td style="text-align: right; color: #3A3A3A; font-size: 13px;">${data.shippingCost === 0 ? "Free" : "₹" + Number(data.shippingCost)}</td></tr>
              <tr><td style="color: #111; font-size: 16px; font-weight: bold; padding-top: 8px;">Total</td><td style="text-align: right; color: #111; font-size: 16px; font-weight: bold; padding-top: 8px;">₹${Number(data.total).toLocaleString("en-IN")}</td></tr>
            </table>
          </div>
        </div>
        <div style="background: #F9F6F1; border-radius: 8px; padding: 16px; text-align: center; margin-bottom: 16px;">
          <p style="color: #3A3A3A; font-size: 13px; margin: 0;">
            We're preparing your order with care. You'll receive a shipping confirmation once it's dispatched.
          </p>
        </div>
        <div style="text-align: center; margin: 24px 0;">
          ${data.invoiceUrl ? `<a href="${escapeHtml(data.invoiceUrl)}" style="display: inline-block; padding: 12px 28px; background: #C8A84B; color: #fff; text-decoration: none; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; border-radius: 50px; margin-right: 8px; margin-bottom: 8px;">View Invoice</a>` : ""}
          <a href="https://www.jewelsbygeetika.com/account" style="display: inline-block; padding: 12px 28px; background: #111; color: #fff; text-decoration: none; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; border-radius: 50px;">
            View My Orders
          </a>
        </div>
        <div style="border-top: 1px solid #E8D9C5; margin-top: 32px; padding-top: 16px; text-align: center;">
          <p style="color: #787878; font-size: 11px;">Need help? Contact us at <a href="mailto:contact@jewelsbygeetika.com" style="color: #C8A84B;">contact@jewelsbygeetika.com</a></p>
        </div>
      </div>
    `,
  });
}

export async function sendOrderShippedEmail(data: {
  email: string;
  name: string;
  orderId: string;
  trackingNumber: string;
  courierPartner: string;
  items: OrderEmailItem[];
}): Promise<void> {
  const resend = getResend();
  if (!resend) return;

  const itemsList = data.items
    .map((item) => `• ${escapeHtml(item.name)} × ${Number(item.quantity)}`)
    .join("<br>");
  const shortId = escapeHtml(data.orderId.slice(0, 8));

  await resend.emails.send({
    from: "Jewels by Geetika <orders@jewelsbygeetika.com>",
    to: data.email,
    replyTo: "contact@jewelsbygeetika.com",
    subject: `Your order has been shipped — #${data.orderId.slice(0, 8)}`,
    html: `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #FDFCFA; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #111; font-size: 22px; margin: 0;">Your Order is On Its Way! 📦</h1>
          <p style="color: #3A3A3A; font-size: 14px; margin-top: 8px;">Great news, ${escapeHtml(data.name)}! Your jewellery has been shipped.</p>
        </div>
        <div style="background: white; border: 1px solid #E8D9C5; border-radius: 8px; padding: 20px; margin-bottom: 16px;">
          <p style="color: #787878; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 12px;">Shipment Details</p>
          <p style="color: #252525; font-size: 13px; margin: 4px 0;"><strong>Order ID:</strong> #${shortId}</p>
          <p style="color: #252525; font-size: 13px; margin: 4px 0;"><strong>Courier Partner:</strong> ${escapeHtml(data.courierPartner)}</p>
          <p style="color: #252525; font-size: 13px; margin: 4px 0;"><strong>Tracking Number:</strong> ${escapeHtml(data.trackingNumber)}</p>
        </div>
        <div style="background: white; border: 1px solid #E8D9C5; border-radius: 8px; padding: 20px; margin-bottom: 16px;">
          <p style="color: #787878; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 12px;">Items in this shipment</p>
          <p style="color: #252525; font-size: 13px; line-height: 1.8;">${itemsList}</p>
        </div>
        <div style="background: #F9F6F1; border-radius: 8px; padding: 16px; text-align: center; margin-bottom: 16px;">
          <p style="color: #3A3A3A; font-size: 13px; margin: 0;">
            📍 Track your order using the tracking number above on your courier partner's website.
          </p>
        </div>
        <div style="text-align: center; margin: 24px 0;">
          <a href="https://www.jewelsbygeetika.com/account" style="display: inline-block; padding: 12px 28px; background: #111; color: #fff; text-decoration: none; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; border-radius: 50px;">
            View My Orders
          </a>
        </div>
        <div style="border-top: 1px solid #E8D9C5; margin-top: 32px; padding-top: 16px; text-align: center;">
          <p style="color: #787878; font-size: 11px;">Need help? Contact us at <a href="mailto:contact@jewelsbygeetika.com" style="color: #C8A84B;">contact@jewelsbygeetika.com</a></p>
        </div>
      </div>
    `,
  });
}

export async function sendAdminOrderNotification(order: {
  payment_id: string;
  payment_method: string;
  total: number;
  shipping_cost: number;
  shipping_name: string;
  shipping_email: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_pincode: string;
  items: OrderEmailItem[];
  warnings?: string[];
}): Promise<void> {
  const resend = getResend();
  if (!resend) return;

  const itemsList = order.items
    .map((item) => `• ${escapeHtml(item.name)} × ${Number(item.quantity)} — ₹${(item.price * item.quantity).toLocaleString("en-IN")}`)
    .join("\n");

  const paymentMethod = order.payment_method === "cod" ? "Cash on Delivery" : "Prepaid (Razorpay)";
  const warningsHtml = order.warnings?.length
    ? `<div style="background: #FEF2F2; border: 1px solid #FECACA; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
        <p style="color: #B91C1C; font-size: 13px; margin: 0;"><strong>⚠️ Attention:</strong><br>${order.warnings.map(escapeHtml).join("<br>")}</p>
      </div>`
    : "";

  await resend.emails.send({
    from: "Jewels by Geetika <notification@jewelsbygeetika.com>",
    to: ADMIN_EMAILS,
    subject: `🛍️ New Order — ₹${Number(order.total).toLocaleString("en-IN")} from ${order.shipping_name}`,
    html: `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #FDFCFA; border-radius: 12px;">
        <h1 style="color: #111; font-size: 22px; margin-bottom: 4px;">🎉 New Order Received!</h1>
        <p style="color: #3A3A3A; font-size: 14px; margin-bottom: 24px;">A customer just placed an order on Jewels by Geetika.</p>
        ${warningsHtml}
        <div style="background: white; border: 1px solid #E8D9C5; border-radius: 8px; padding: 20px; margin-bottom: 16px;">
          <h2 style="color: #111; font-size: 16px; margin: 0 0 12px;">Order Details</h2>
          <p style="color: #3A3A3A; font-size: 13px; margin: 4px 0;"><strong>Order ID:</strong> ${escapeHtml(order.payment_id || "N/A")}</p>
          <p style="color: #3A3A3A; font-size: 13px; margin: 4px 0;"><strong>Payment:</strong> ${paymentMethod}</p>
          <p style="color: #3A3A3A; font-size: 13px; margin: 4px 0;"><strong>Total:</strong> ₹${Number(order.total).toLocaleString("en-IN")}</p>
          <p style="color: #3A3A3A; font-size: 13px; margin: 4px 0;"><strong>Shipping:</strong> ₹${Number(order.shipping_cost) || 0}</p>
        </div>
        <div style="background: white; border: 1px solid #E8D9C5; border-radius: 8px; padding: 20px; margin-bottom: 16px;">
          <h2 style="color: #111; font-size: 16px; margin: 0 0 12px;">Items</h2>
          <pre style="color: #3A3A3A; font-size: 13px; white-space: pre-wrap; margin: 0;">${itemsList}</pre>
        </div>
        <div style="background: white; border: 1px solid #E8D9C5; border-radius: 8px; padding: 20px;">
          <h2 style="color: #111; font-size: 16px; margin: 0 0 12px;">Shipping Address</h2>
          <p style="color: #3A3A3A; font-size: 13px; margin: 4px 0;"><strong>${escapeHtml(order.shipping_name)}</strong></p>
          <p style="color: #3A3A3A; font-size: 13px; margin: 4px 0;">📞 ${escapeHtml(order.shipping_phone)}</p>
          <p style="color: #3A3A3A; font-size: 13px; margin: 4px 0;">✉️ ${escapeHtml(order.shipping_email || "Not provided")}</p>
          <p style="color: #3A3A3A; font-size: 13px; margin: 4px 0;">${escapeHtml(order.shipping_address)}</p>
          <p style="color: #3A3A3A; font-size: 13px; margin: 4px 0;">${escapeHtml(order.shipping_city)}, ${escapeHtml(order.shipping_state)} - ${escapeHtml(order.shipping_pincode)}</p>
        </div>
        <p style="color: #787878; font-size: 11px; margin-top: 20px; text-align: center;">
          Manage this order at <a href="https://www.jewelsbygeetika.com/admin" style="color: #C8A84B;">Admin Dashboard</a>
        </p>
      </div>
    `,
  });
}
