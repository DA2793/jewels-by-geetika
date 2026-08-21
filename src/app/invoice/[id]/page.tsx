"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { generateInvoiceHTML, InvoiceData } from "@/lib/invoice-template";
import { ADMIN_EMAILS } from "@/lib/admin-emails";

export default function InvoicePage() {
  const params = useParams();
  const { user, loading: authLoading } = useAuth();
  const [invoiceHtml, setInvoiceHtml] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading || !user) return;

    const loadOrder = async () => {
      const supabase = createClient();
      if (!supabase) return;

      const { data: order } = await supabase
        .from("orders")
        .select("*")
        .eq("id", params.id)
        .single();

      if (!order) {
        setError("Order not found");
        return;
      }

      // Only allow the order owner or admins to view
      if (order.user_id !== user.id && !ADMIN_EMAILS.includes(user.email || "")) {
        setError("Unauthorized");
        return;
      }

      const orderDate = new Date(order.created_at);
      const invoiceNumber = `JBG-${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, "0")}${String(orderDate.getDate()).padStart(2, "0")}-${order.id.slice(0, 4).toUpperCase()}`;

      const subtotal = order.items?.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0) || 0;

      const invoiceData: InvoiceData = {
        invoiceNumber,
        date: orderDate.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }),
        orderId: order.payment_id || order.id,
        paymentMethod: order.payment_method || (order.payment_status === "paid" ? "prepaid" : "cod"),
        customer: {
          name: order.shipping_name || "Customer",
          phone: order.shipping_phone || "",
          email: order.shipping_email || "",
        },
        shipping: {
          address: order.shipping_address || "",
          city: order.shipping_city || "",
          state: order.shipping_state || "",
          pincode: order.shipping_pincode || "",
        },
        items: order.items || [],
        subtotal,
        discount: order.discount || undefined,
        promoCode: order.promo_code || undefined,
        shippingCost: order.shipping_cost || 0,
        codFee: order.cod_fee || undefined,
        total: order.total || 0,
      };

      setInvoiceHtml(generateInvoiceHTML(invoiceData));
    };

    loadOrder();
  }, [user, authLoading, params.id]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-charcoal-700">{error}</p>
      </div>
    );
  }

  if (!invoiceHtml) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Print/Download Button */}
      <div className="no-print fixed top-4 right-4 z-50 flex gap-2">
        <button
          onClick={() => window.print()}
          className="px-6 py-3 bg-charcoal-800 text-white text-xs uppercase tracking-wider rounded-full hover:bg-gold-600 transition-colors shadow-lg"
        >
          Download PDF
        </button>
      </div>
      <div dangerouslySetInnerHTML={{ __html: invoiceHtml }} />
      <style jsx global>{`
        /* Hide site navigation, footer, and floaters on invoice page */
        nav,
        footer,
        a[aria-label="Follow us on Instagram"],
        a[aria-label="Chat on WhatsApp"] {
          display: none !important;
        }
        main {
          padding-top: 0 !important;
        }
        @media print {
          .no-print { display: none !important; }
          nav,
          footer,
          a[aria-label="Follow us on Instagram"],
          a[aria-label="Chat on WhatsApp"] {
            display: none !important;
          }
          body { margin: 0; padding: 0; }
          main { padding: 0 !important; }
        }
      `}</style>
    </div>
  );
}
