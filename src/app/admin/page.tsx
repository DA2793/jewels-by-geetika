"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { ADMIN_EMAILS } from "@/lib/admin-emails";

interface Order {
  id: string;
  created_at: string;
  status: string;
  total: number;
  shipping_cost: number;
  shipping_name: string;
  shipping_email: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_pincode: string;
  payment_status: string;
  tracking_number: string;
  courier_partner: string;
  items: { name: string; quantity: number; price: number }[];
}

interface Customer {
  id: string;
  email: string;
  phone: string;
  created_at: string;
  full_name: string;
  last_sign_in_at: string;
}

interface AbandonedCart {
  id: string;
  user_email: string;
  user_phone: string;
  items: { name: string; quantity: number; price: number; image: string }[];
  total: number;
  last_updated: string;
  reminder_sent: boolean;
  recovered: boolean;
  created_at: string;
}

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState<"orders" | "customers" | "abandoned">("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [abandonedCarts, setAbandonedCarts] = useState<AbandonedCart[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Auth check
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
    }
    if (!authLoading && user && !ADMIN_EMAILS.includes(user.email || "")) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  // Load data
  useEffect(() => {
    if (user && supabase && ADMIN_EMAILS.includes(user.email || "")) {
      loadOrders();
      loadCustomers();
      loadAbandonedCarts();
    }
  }, [user, supabase]);

  const loadOrders = async () => {
    if (!supabase) return;
    const { data } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setOrders(data as Order[]);
    setLoadingData(false);
  };

  const loadCustomers = async () => {
    if (!supabase) return;
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setCustomers(data as Customer[]);
  };

  const loadAbandonedCarts = async () => {
    if (!supabase) return;
    const { data } = await supabase
      .from("abandoned_carts")
      .select("*")
      .eq("recovered", false)
      .order("last_updated", { ascending: false });
    if (data) setAbandonedCarts(data as AbandonedCart[]);
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    if (!supabase) return;
    setUpdatingStatus(true);
    await supabase
      .from("orders")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", orderId);
    await loadOrders();
    setUpdatingStatus(false);
    if (selectedOrder?.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }
  };

  const updateTracking = async (orderId: string, trackingNumber: string, courier: string) => {
    if (!supabase) return;
    await supabase
      .from("orders")
      .update({
        tracking_number: trackingNumber,
        courier_partner: courier,
        status: "shipped",
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    // Send shipped email to customer
    const order = orders.find((o) => o.id === orderId);
    if (order?.shipping_email) {
      fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "order-shipped",
          data: {
            email: order.shipping_email,
            name: order.shipping_name,
            orderId: orderId,
            trackingNumber,
            courierPartner: courier,
            items: order.items,
          },
        }),
      }).catch(() => {});
    }

    await loadOrders();
  };

  if (authLoading || !user || !ADMIN_EMAILS.includes(user.email || "")) {
    return (
      <div className="pt-32 pb-16 bg-cream-50 min-h-screen flex items-center justify-center">
        <div className="inline-block w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-50 text-yellow-700",
    confirmed: "bg-blue-50 text-blue-700",
    shipped: "bg-purple-50 text-purple-700",
    delivered: "bg-green-50 text-green-700",
    cancelled: "bg-red-50 text-red-700",
  };

  const orderStats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    confirmed: orders.filter((o) => o.status === "confirmed").length,
    shipped: orders.filter((o) => o.status === "shipped").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
  };

  return (
    <div className="pt-28 pb-16 bg-cream-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-display font-bold text-charcoal-900">
            Admin Dashboard
          </h1>
          <p className="text-charcoal-700 mt-1">Manage orders and customers</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            { label: "Total Orders", value: orderStats.total, color: "text-charcoal-900" },
            { label: "Pending", value: orderStats.pending, color: "text-yellow-600" },
            { label: "Confirmed", value: orderStats.confirmed, color: "text-blue-600" },
            { label: "Shipped", value: orderStats.shipped, color: "text-purple-600" },
            { label: "Delivered", value: orderStats.delivered, color: "text-green-600" },
          ].map((stat) => (
            <div key={stat.label} className="glass-card p-4 text-center">
              <p className={`text-2xl font-display font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-charcoal-700 text-xs uppercase tracking-wider mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-cream-200 rounded-full p-1 w-fit">
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-6 py-2.5 text-xs uppercase tracking-[0.15em] rounded-full transition-all font-medium ${
              activeTab === "orders" ? "bg-charcoal-900 text-white" : "text-charcoal-700"
            }`}
          >
            Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab("customers")}
            className={`px-6 py-2.5 text-xs uppercase tracking-[0.15em] rounded-full transition-all font-medium ${
              activeTab === "customers" ? "bg-charcoal-900 text-white" : "text-charcoal-700"
            }`}
          >
            Customers ({customers.length})
          </button>
          <button
            onClick={() => setActiveTab("abandoned")}
            className={`px-6 py-2.5 text-xs uppercase tracking-[0.15em] rounded-full transition-all font-medium ${
              activeTab === "abandoned" ? "bg-charcoal-900 text-white" : "text-charcoal-700"
            }`}
          >
            Abandoned ({abandonedCarts.length})
          </button>
        </div>

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div>
            {loadingData ? (
              <div className="text-center py-12">
                <div className="inline-block w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : orders.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <p className="text-charcoal-700">No orders yet. They&apos;ll appear here once customers start purchasing.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="glass-card p-6 cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <p className="text-charcoal-900 font-medium">
                          Order #{order.id.slice(0, 8)}
                        </p>
                        <p className="text-charcoal-700 text-sm mt-1">
                          {order.shipping_name || "Guest"} • {order.shipping_phone || "No phone"}
                        </p>
                        <p className="text-charcoal-700 text-xs mt-1">
                          {new Date(order.created_at).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="text-charcoal-900 font-display font-bold text-lg">
                          ₹{order.total?.toLocaleString("en-IN")}
                        </p>
                        <span className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-semibold ${statusColors[order.status] || statusColors.pending}`}>
                          {order.status}
                        </span>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {selectedOrder?.id === order.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-6 pt-6 border-t border-cream-300"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Items */}
                          <div>
                            <h4 className="text-charcoal-900 font-semibold text-sm mb-3">Items</h4>
                            {order.items?.map((item, i) => (
                              <div key={i} className="flex justify-between text-sm text-charcoal-700 mb-1">
                                <span>{item.name} × {item.quantity}</span>
                                <span>₹{(item.price * item.quantity).toLocaleString("en-IN")}</span>
                              </div>
                            ))}
                          </div>

                          {/* Shipping Address */}
                          <div>
                            <h4 className="text-charcoal-900 font-semibold text-sm mb-3">Shipping To</h4>
                            <div className="text-sm text-charcoal-700 space-y-1">
                              <p>{order.shipping_name}</p>
                              <p>{order.shipping_phone}</p>
                              <p>{order.shipping_email}</p>
                              <p>{order.shipping_address}</p>
                              <p>{order.shipping_city}, {order.shipping_state} - {order.shipping_pincode}</p>
                            </div>
                          </div>
                        </div>

                        {/* Status Update */}
                        <div className="mt-6 flex flex-wrap gap-2">
                          <a
                            href={`/invoice/${order.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="px-4 py-2 text-xs uppercase tracking-wider rounded-full bg-gold-100 text-gold-700 hover:bg-gold-200 transition-all"
                          >
                            View Invoice
                          </a>
                          {["pending", "confirmed", "shipped", "delivered", "cancelled"].map((status) => (
                            <button
                              key={status}
                              onClick={(e) => {
                                e.stopPropagation();
                                updateOrderStatus(order.id, status);
                              }}
                              disabled={updatingStatus || order.status === status}
                              className={`px-4 py-2 text-xs uppercase tracking-wider rounded-full transition-all ${
                                order.status === status
                                  ? "bg-charcoal-900 text-white"
                                  : "bg-cream-200 text-charcoal-700 hover:bg-charcoal-900 hover:text-white"
                              } disabled:opacity-50`}
                            >
                              {status}
                            </button>
                          ))}
                        </div>

                        {/* Tracking */}
                        {order.status === "shipped" && (
                          <div className="mt-4 flex gap-3">
                            <input
                              type="text"
                              placeholder="Tracking number"
                              defaultValue={order.tracking_number || ""}
                              className="flex-1 bg-white border border-cream-400 rounded-xl px-4 py-2 text-sm text-charcoal-800 focus:outline-none focus:border-gold-400"
                              id={`tracking-${order.id}`}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <input
                              type="text"
                              placeholder="Courier"
                              defaultValue={order.courier_partner || ""}
                              className="w-32 bg-white border border-cream-400 rounded-xl px-4 py-2 text-sm text-charcoal-800 focus:outline-none focus:border-gold-400"
                              id={`courier-${order.id}`}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const tracking = (document.getElementById(`tracking-${order.id}`) as HTMLInputElement)?.value;
                                const courier = (document.getElementById(`courier-${order.id}`) as HTMLInputElement)?.value;
                                if (tracking) updateTracking(order.id, tracking, courier);
                              }}
                              className="px-4 py-2 bg-charcoal-900 text-white text-xs uppercase tracking-wider rounded-xl hover:bg-gold-600 transition-colors"
                            >
                              Save
                            </button>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Customers Tab */}
        {activeTab === "customers" && (
          <div>
            {customers.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <p className="text-charcoal-700">No customers yet.</p>
              </div>
            ) : (
              <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-cream-200">
                        <th className="text-left py-3 px-4 text-charcoal-800 font-semibold">Name</th>
                        <th className="text-left py-3 px-4 text-charcoal-800 font-semibold">Phone</th>
                        <th className="text-left py-3 px-4 text-charcoal-800 font-semibold">Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customers.map((customer) => (
                        <tr key={customer.id} className="border-b border-cream-300">
                          <td className="py-3 px-4 text-charcoal-800">
                            {customer.full_name || "—"}
                          </td>
                          <td className="py-3 px-4 text-charcoal-700">
                            {customer.phone || "—"}
                          </td>
                          <td className="py-3 px-4 text-charcoal-700">
                            {new Date(customer.created_at).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Abandoned Carts Tab */}
        {activeTab === "abandoned" && (
          <div>
            {abandonedCarts.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <p className="text-charcoal-700">No abandoned carts yet. They&apos;ll appear when users add items but don&apos;t checkout.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {abandonedCarts.map((cart) => (
                  <div key={cart.id} className="glass-card p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <p className="text-charcoal-900 font-medium">
                          {cart.user_email || cart.user_phone || "Unknown user"}
                        </p>
                        <p className="text-charcoal-700 text-sm mt-1">
                          {cart.items?.length || 0} item(s) • Last active:{" "}
                          {new Date(cart.last_updated).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="text-charcoal-900 font-display font-bold text-lg">
                          ₹{cart.total?.toLocaleString("en-IN")}
                        </p>
                        {cart.reminder_sent ? (
                          <span className="px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-semibold bg-blue-50 text-blue-700">
                            Reminded
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-semibold bg-yellow-50 text-yellow-700">
                            Not reminded
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Items */}
                    <div className="mt-4 pt-4 border-t border-cream-300">
                      {cart.items?.map((item, i) => (
                        <div key={i} className="flex justify-between text-sm text-charcoal-700 mb-1">
                          <span>{item.name} × {item.quantity}</span>
                          <span>₹{(item.price * item.quantity).toLocaleString("en-IN")}</span>
                        </div>
                      ))}
                    </div>
                    {/* Action — placeholder for WhatsApp reminder */}
                    {!cart.reminder_sent && cart.user_phone && (
                      <div className="mt-4">
                        <a
                          href={`https://wa.me/${cart.user_phone.replace("+", "")}?text=${encodeURIComponent(`Hi! We noticed you left some beautiful pieces in your cart at Jewels by Geetika. Your ${cart.items?.[0]?.name || "jewellery"} is waiting for you! Complete your order: https://www.jewelsbygeetika.com/collections`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block px-4 py-2 bg-green-500 text-white text-xs uppercase tracking-wider rounded-full hover:bg-green-600 transition-colors"
                        >
                          Send WhatsApp Reminder
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
