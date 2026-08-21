"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { isExpressEligible } from "@/lib/express-pincodes";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const { items, totalPrice, clearCart, markCartRecovered, removeFromCart } = useCart();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [expressShipping, setExpressShipping] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"prepaid" | "cod">("prepaid");
  const [promoInput, setPromoInput] = useState("");
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoApplied, setPromoApplied] = useState("");
  const [promoError, setPromoError] = useState("");
  const codFee = 99;
  const codEligible = totalPrice <= 1999;
  const baseShippingCost = totalPrice > 999 ? 0 : totalPrice >= 799 ? 49 : 79;
  const shippingCost = baseShippingCost + (expressShipping ? 99 : 0);
  const orderTotal = totalPrice - promoDiscount + shippingCost + (paymentMethod === "cod" ? codFee : 0);
  const [paying, setPaying] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  // Checkout gate — require login (redirect as an effect, not during render)
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
    }
  }, [authLoading, user, router]);

  // Load Razorpay script
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setPaying(true);
    setCheckoutError("");

    const payload = {
      items: items.map((item) => ({ id: item.product.id, quantity: item.quantity })),
      promoCode: promoApplied || null,
      expressShipping,
      paymentMethod,
      customer: { ...form },
    };

    // Create the order server-side — prices, promo, and stock are all
    // computed and validated on the server; nothing here is trusted.
    let data: any;
    try {
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      data = await res.json();
      if (!res.ok) {
        setCheckoutError(data.error || "Could not place order. Please try again.");
        setPaying(false);
        return;
      }
    } catch {
      setCheckoutError("Network error. Please check your connection and try again.");
      setPaying(false);
      return;
    }

    // ── COD: order is already finalized server-side ──
    if (data.paymentMethod === "cod") {
      await markCartRecovered();
      clearCart();
      router.push(`/order-success?id=${data.orderId}`);
      setPaying(false);
      return;
    }

    // ── Prepaid: open Razorpay with the server-created order ──
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      setCheckoutError("Failed to load payment gateway. Please try again.");
      setPaying(false);
      return;
    }

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: data.amountPaise,
      currency: data.currency || "INR",
      name: "Jewels by Geetika",
      description: `Order of ${items.length} item(s)`,
      order_id: data.razorpayOrderId,
      handler: async (response: Record<string, string>) => {
        try {
          const verifyRes = await fetch("/api/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });
          const verification = await verifyRes.json();

          if (verification.verified) {
            await markCartRecovered();
            clearCart();
            router.push(`/order-success?id=${verification.orderId || response.razorpay_payment_id}`);
          } else {
            setCheckoutError("Payment verification failed. If money was deducted, please contact support — your order will be recorded automatically.");
          }
        } catch {
          // Payment went through; the webhook will record the order.
          router.push(`/order-success?id=${response.razorpay_payment_id}`);
        }
        setPaying(false);
      },
      prefill: {
        name: `${form.firstName} ${form.lastName}`,
        email: form.email || user?.email || "",
        contact: form.phone,
      },
      theme: {
        color: "#C8A84B",
      },
      modal: {
        ondismiss: () => setPaying(false),
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    // Reset express shipping if pincode changes to non-eligible
    if (name === "pincode" && !isExpressEligible(value)) {
      setExpressShipping(false);
    }
  };

  // While redirecting to login, show a spinner
  if (!authLoading && !user) {
    return (
      <div className="pt-32 pb-16 bg-cream-50 min-h-screen flex items-center justify-center">
        <div className="inline-block w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="pt-32 pb-16 text-center bg-cream-50 min-h-screen">
        <div className="text-5xl mb-4">✦</div>
        <h1 className="text-2xl font-serif text-charcoal-700 mb-3">
          Your bag is empty
        </h1>
        <p className="text-charcoal-800 font-light mb-6">
          Add some beautiful pieces before checking out.
        </p>
        <Link href="/collections">
          <motion.span
            whileHover={{ scale: 1.03 }}
            className="inline-block px-8 py-3 bg-charcoal-800 text-white font-light uppercase tracking-[0.2em] text-sm hover:bg-gold-600 transition-colors rounded-full cursor-pointer"
          >
            Browse Collections
          </motion.span>
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-16 bg-cream-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <Link
            href="/collections"
            className="text-charcoal-800 text-sm hover:text-gold-600 transition-colors mb-4 inline-block"
          >
            ← Continue Shopping
          </Link>
          <h1 className="text-3xl md:text-4xl font-serif text-charcoal-800">
            Checkout
          </h1>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Left — Shipping Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-3"
          >
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
              <h2 className="font-serif text-xl text-charcoal-800 mb-6">
                Shipping Details
              </h2>

              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="firstName" className="block text-charcoal-700 text-xs uppercase tracking-[0.15em] mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      required
                      value={form.firstName}
                      onChange={handleChange}
                      className="w-full bg-cream-50 border border-cream-400 rounded-xl px-4 py-3 text-charcoal-700 focus:outline-none focus:border-gold-400 transition-colors"
                      placeholder="First name"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-charcoal-700 text-xs uppercase tracking-[0.15em] mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      required
                      value={form.lastName}
                      onChange={handleChange}
                      className="w-full bg-cream-50 border border-cream-400 rounded-xl px-4 py-3 text-charcoal-700 focus:outline-none focus:border-gold-400 transition-colors"
                      placeholder="Last name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="email" className="block text-charcoal-700 text-xs uppercase tracking-[0.15em] mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={form.email}
                      onChange={handleChange}
                      className="w-full bg-cream-50 border border-cream-400 rounded-xl px-4 py-3 text-charcoal-700 focus:outline-none focus:border-gold-400 transition-colors"
                      placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-charcoal-700 text-xs uppercase tracking-[0.15em] mb-2">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      required
                      value={form.phone}
                      onChange={handleChange}
                      className="w-full bg-cream-50 border border-cream-400 rounded-xl px-4 py-3 text-charcoal-700 focus:outline-none focus:border-gold-400 transition-colors"
                      placeholder="+91 99999 99999"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="address" className="block text-charcoal-700 text-xs uppercase tracking-[0.15em] mb-2">
                    Address *
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    required
                    value={form.address}
                    onChange={handleChange}
                    className="w-full bg-cream-50 border border-cream-400 rounded-xl px-4 py-3 text-charcoal-700 focus:outline-none focus:border-gold-400 transition-colors"
                    placeholder="House no., Street, Locality"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div>
                    <label htmlFor="city" className="block text-charcoal-700 text-xs uppercase tracking-[0.15em] mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      required
                      value={form.city}
                      onChange={handleChange}
                      className="w-full bg-cream-50 border border-cream-400 rounded-xl px-4 py-3 text-charcoal-700 focus:outline-none focus:border-gold-400 transition-colors"
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <label htmlFor="state" className="block text-charcoal-700 text-xs uppercase tracking-[0.15em] mb-2">
                      State *
                    </label>
                    <select
                      id="state"
                      name="state"
                      required
                      value={form.state}
                      onChange={handleChange}
                      className="w-full bg-cream-50 border border-cream-400 rounded-xl px-4 py-3 text-charcoal-700 focus:outline-none focus:border-gold-400 transition-colors"
                    >
                      <option value="">Select</option>
                      <option value="AN">Andaman and Nicobar Islands</option>
                      <option value="AP">Andhra Pradesh</option>
                      <option value="AR">Arunachal Pradesh</option>
                      <option value="AS">Assam</option>
                      <option value="BR">Bihar</option>
                      <option value="CH">Chandigarh</option>
                      <option value="CT">Chhattisgarh</option>
                      <option value="DL">Delhi</option>
                      <option value="GA">Goa</option>
                      <option value="GJ">Gujarat</option>
                      <option value="HR">Haryana</option>
                      <option value="HP">Himachal Pradesh</option>
                      <option value="JK">Jammu and Kashmir</option>
                      <option value="JH">Jharkhand</option>
                      <option value="KA">Karnataka</option>
                      <option value="KL">Kerala</option>
                      <option value="MP">Madhya Pradesh</option>
                      <option value="MH">Maharashtra</option>
                      <option value="MN">Manipur</option>
                      <option value="ML">Meghalaya</option>
                      <option value="MZ">Mizoram</option>
                      <option value="NL">Nagaland</option>
                      <option value="OR">Odisha</option>
                      <option value="PB">Punjab</option>
                      <option value="RJ">Rajasthan</option>
                      <option value="SK">Sikkim</option>
                      <option value="TN">Tamil Nadu</option>
                      <option value="TG">Telangana</option>
                      <option value="TR">Tripura</option>
                      <option value="UP">Uttar Pradesh</option>
                      <option value="UT">Uttarakhand</option>
                      <option value="WB">West Bengal</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="pincode" className="block text-charcoal-700 text-xs uppercase tracking-[0.15em] mb-2">
                      Pincode *
                    </label>
                    <input
                      type="text"
                      id="pincode"
                      name="pincode"
                      required
                      value={form.pincode}
                      onChange={handleChange}
                      className="w-full bg-cream-50 border border-cream-400 rounded-xl px-4 py-3 text-charcoal-700 focus:outline-none focus:border-gold-400 transition-colors"
                      placeholder="110001"
                      maxLength={6}
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right — Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm sticky top-28">
              <h2 className="font-serif text-xl text-charcoal-800 mb-6">
                Order Summary
              </h2>

              {/* Items */}
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.product.id} className="flex gap-3">
                    <div className="relative w-16 h-20 rounded-lg overflow-hidden bg-cream-200 flex-shrink-0">
                      <Image
                        src={item.product.images[0]}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-charcoal-700 text-sm font-medium truncate">
                        {item.product.name}
                      </h3>
                      <p className="text-charcoal-800 text-xs font-light">
                        Qty: {item.quantity}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-charcoal-800 text-sm">
                          ₹{(item.product.price * item.quantity).toLocaleString("en-IN")}
                        </p>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-charcoal-700 hover:text-red-400 text-xs transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Promo Code */}
              <div className="border-t border-cream-300 pt-4">
                <p className="text-charcoal-800 text-xs uppercase tracking-[0.15em] font-medium mb-2">Promo Code</p>
                {promoApplied ? (
                  <div className="flex items-center justify-between py-2 px-3 bg-green-50 rounded-xl border border-green-100">
                    <div className="flex items-center gap-2">
                      <span className="text-green-700 text-sm font-medium">{promoApplied}</span>
                      <span className="text-green-600 text-xs">(-₹{promoDiscount})</span>
                    </div>
                    <button
                      onClick={() => { setPromoApplied(""); setPromoDiscount(0); setPromoInput(""); }}
                      className="text-red-400 text-xs hover:text-red-600 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoInput}
                      onChange={(e) => { setPromoInput(e.target.value.toUpperCase()); setPromoError(""); }}
                      placeholder="Enter code"
                      className="flex-1 bg-cream-50 border border-cream-400 rounded-xl px-3 py-2 text-charcoal-800 text-sm focus:outline-none focus:border-gold-400 transition-colors"
                    />
                    <button
                      onClick={async () => {
                        if (!promoInput.trim()) return;
                        try {
                          const res = await fetch("/api/validate-promo", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              code: promoInput,
                              items: items.map((item) => ({ id: item.product.id, quantity: item.quantity })),
                            }),
                          });
                          const result = await res.json();
                          if (result.valid && result.discount) {
                            setPromoDiscount(result.discount);
                            setPromoApplied(promoInput.trim().toUpperCase());
                            setPromoError("");
                          } else {
                            setPromoError(result.error || "Invalid code");
                          }
                        } catch {
                          setPromoError("Could not validate code. Please try again.");
                        }
                      }}
                      className="px-4 py-2 bg-charcoal-800 text-white text-xs uppercase tracking-wider rounded-xl hover:bg-gold-600 transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                )}
                {promoError && <p className="text-red-500 text-xs mt-1">{promoError}</p>}
              </div>

              {/* Totals */}
              <div className="border-t border-cream-300 pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-charcoal-800 font-light">Subtotal</span>
                  <span className="text-charcoal-700">
                    ₹{totalPrice.toLocaleString("en-IN")}
                  </span>
                </div>
                {promoDiscount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600 font-light">Promo ({promoApplied})</span>
                    <span className="text-green-600">-₹{promoDiscount.toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-charcoal-800 font-light">Shipping</span>
                  <span className="text-charcoal-700">
                    {baseShippingCost === 0 && !expressShipping ? (
                      <span className="text-green-600">Free</span>
                    ) : (
                      `₹${shippingCost}`
                    )}
                  </span>
                </div>
                {baseShippingCost > 0 && !expressShipping && (
                  <p className="text-xs text-gold-600 font-light">
                    Free shipping on orders above ₹999
                  </p>
                )}

                {/* Express Shipping Option — only for eligible pincodes */}
                {isExpressEligible(form.pincode) && (
                <label className="flex items-center justify-between py-3 px-4 bg-cream-50 rounded-xl border border-cream-400 cursor-pointer hover:border-gold-400 transition-colors">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={expressShipping}
                      onChange={(e) => setExpressShipping(e.target.checked)}
                      className="w-4 h-4 accent-gold-600 rounded"
                    />
                    <div>
                      <span className="text-charcoal-800 text-sm font-medium">Express Shipping</span>
                      <p className="text-charcoal-700 text-[10px]">Faster delivery (2–3 business days)</p>
                    </div>
                  </div>
                  <span className="text-charcoal-800 text-sm font-medium">+₹99</span>
                </label>
                )}
                {paymentMethod === "cod" && (
                  <div className="flex justify-between text-sm">
                    <span className="text-charcoal-800 font-light">COD Fee</span>
                    <span className="text-charcoal-700">₹{codFee}</span>
                  </div>
                )}
                <div className="flex justify-between pt-3 border-t border-cream-300">
                  <span className="text-charcoal-800 font-medium">Total</span>
                  <span className="text-charcoal-800 font-serif text-xl">
                    ₹{orderTotal.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Payment Method */}
              <div className="border-t border-cream-300 pt-4 mt-2">
                <h3 className="text-charcoal-800 text-xs uppercase tracking-[0.15em] font-medium mb-3">Payment Method</h3>
                <div className="space-y-2">
                  <label className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${paymentMethod === "prepaid" ? "border-gold-500 bg-gold-50/30" : "border-cream-400 hover:border-gold-400"}`}>
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === "prepaid"}
                        onChange={() => setPaymentMethod("prepaid")}
                        className="w-4 h-4 accent-gold-600"
                      />
                      <div>
                        <span className="text-charcoal-800 text-sm font-medium">Pay Online</span>
                        <p className="text-charcoal-700 text-[10px]">UPI, Cards, Wallets</p>
                      </div>
                    </div>
                    <span className="text-green-600 text-[10px] font-medium uppercase tracking-wider">Recommended</span>
                  </label>

                  <label className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${!codEligible ? "opacity-50 cursor-not-allowed" : paymentMethod === "cod" ? "border-gold-500 bg-gold-50/30" : "border-cream-400 hover:border-gold-400"}`}>
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === "cod"}
                        onChange={() => codEligible && setPaymentMethod("cod")}
                        disabled={!codEligible}
                        className="w-4 h-4 accent-gold-600"
                      />
                      <div>
                        <span className="text-charcoal-800 text-sm font-medium">Cash on Delivery</span>
                        <p className="text-charcoal-700 text-[10px]">
                          {codEligible ? "+₹99 COD fee • Orders up to ₹1,999" : "Not available for orders above ₹1,999"}
                        </p>
                      </div>
                    </div>
                    <span className="text-charcoal-700 text-sm font-medium">+₹99</span>
                  </label>
                </div>

                {/* Prepaid Benefits Blurb */}
                {paymentMethod === "cod" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-3 p-3 bg-green-50 rounded-xl border border-green-100"
                  >
                    <p className="text-green-800 text-[11px] font-semibold mb-1.5">💡 Why pay online instead?</p>
                    <ul className="text-green-700 text-[10px] space-y-0.5">
                      <li>• Save ₹99 — no COD fee</li>
                      <li>• Faster processing &amp; priority dispatch</li>
                      <li>• Instant order confirmation</li>
                      <li>• Hassle-free — no cash needed at delivery</li>
                    </ul>
                    <button
                      onClick={() => setPaymentMethod("prepaid")}
                      className="mt-2 text-green-700 text-[10px] font-semibold underline hover:text-green-900 transition-colors"
                    >
                      Switch to Pay Online →
                    </button>
                  </motion.div>
                )}
              </div>

              {/* Checkout error */}
              {checkoutError && (
                <div className="mt-4 py-3 px-4 bg-red-50 border border-red-100 rounded-xl" role="alert">
                  <p className="text-red-600 text-sm">{checkoutError}</p>
                </div>
              )}

              {/* Pay / Place Order Button */}
              {paymentMethod === "prepaid" ? (
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full mt-6 py-4 bg-charcoal-800 text-white font-medium uppercase tracking-[0.2em] text-sm hover:bg-gold-600 transition-colors rounded-full disabled:opacity-50"
                  onClick={handlePayment}
                  disabled={paying || !form.firstName || !form.phone || !form.address || !form.city || !form.state || !form.pincode}
                >
                  {paying ? "Processing..." : `Pay ₹${orderTotal.toLocaleString("en-IN")}`}
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full mt-6 py-4 bg-charcoal-800 text-white font-medium uppercase tracking-[0.2em] text-sm hover:bg-gold-600 transition-colors rounded-full disabled:opacity-50"
                  onClick={handlePayment}
                  disabled={paying || !form.firstName || !form.phone || !form.address || !form.city || !form.state || !form.pincode}
                >
                  {paying ? "Processing..." : `Place COD Order • ₹${orderTotal.toLocaleString("en-IN")}`}
                </motion.button>
              )}

              <p className="text-center text-charcoal-700 text-[10px] mt-3 font-light">
                {paymentMethod === "prepaid" ? "Secure payment powered by Razorpay" : "Pay ₹" + orderTotal.toLocaleString("en-IN") + " at delivery (includes ₹99 COD fee)"}
              </p>

              {/* Trust */}
              <div className="flex justify-center gap-6 mt-6 pt-4 border-t border-cream-300">
                {["🔒 Secure", "📦 Tracked", "✦ Curated"].map((t) => (
                  <span key={t} className="text-charcoal-700 text-[10px] uppercase tracking-wider">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
