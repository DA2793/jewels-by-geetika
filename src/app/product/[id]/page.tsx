"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { getProductById, getFeaturedProducts } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";

function ImageZoomModal({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const zoomIn = () => setScale((s) => Math.min(s + 0.5, 4));
  const zoomOut = () => {
    setScale((s) => {
      const newScale = Math.max(s - 0.5, 1);
      if (newScale === 1) setPosition({ x: 0, y: 0 });
      return newScale;
    });
  };
  const resetZoom = () => { setScale(1); setPosition({ x: 0, y: 0 }); };

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.3 : 0.3;
    setScale((s) => {
      const newScale = Math.max(1, Math.min(s + delta, 4));
      if (newScale === 1) setPosition({ x: 0, y: 0 });
      return newScale;
    });
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return;
    setDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => setDragging(false);

  // Touch support for pinch zoom
  const lastTouchDistance = useRef<number | null>(null);
  const lastTouchCenter = useRef({ x: 0, y: 0 });

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (lastTouchDistance.current !== null) {
        const delta = (distance - lastTouchDistance.current) * 0.01;
        setScale((s) => {
          const newScale = Math.max(1, Math.min(s + delta, 4));
          if (newScale === 1) setPosition({ x: 0, y: 0 });
          return newScale;
        });
      }
      lastTouchDistance.current = distance;
    } else if (e.touches.length === 1 && scale > 1) {
      const touch = e.touches[0];
      if (lastTouchCenter.current.x !== 0) {
        const dx = touch.clientX - lastTouchCenter.current.x;
        const dy = touch.clientY - lastTouchCenter.current.y;
        setPosition((p) => ({ x: p.x + dx, y: p.y + dy }));
      }
      lastTouchCenter.current = { x: touch.clientX, y: touch.clientY };
    }
  }, [scale]);

  const handleTouchEnd = () => {
    lastTouchDistance.current = null;
    lastTouchCenter.current = { x: 0, y: 0 };
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "+" || e.key === "=") zoomIn();
      if (e.key === "-") zoomOut();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Controls */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        <button onClick={zoomIn} className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors" aria-label="Zoom in">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12M6 12h12" /></svg>
        </button>
        <button onClick={zoomOut} className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors" aria-label="Zoom out">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12h12" /></svg>
        </button>
        <button onClick={resetZoom} className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors text-xs font-medium" aria-label="Reset zoom">
          {Math.round(scale * 100)}%
        </button>
        <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors" aria-label="Close">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      {/* Zoom hint */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 text-xs z-10">
        Scroll to zoom · Drag to pan · Esc to close
      </div>

      {/* Image container */}
      <div
        ref={containerRef}
        className="w-full h-full flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="relative w-[85vmin] h-[85vmin] transition-transform duration-150 ease-out"
          style={{ transform: `translate(${position.x}px, ${position.y}px) scale(${scale})` }}
        >
          <Image
            src={src}
            alt={alt}
            fill
            className="object-contain select-none pointer-events-none"
            sizes="85vmin"
            priority
            draggable={false}
          />
        </div>
      </div>
    </motion.div>
  );
}

function WishlistButtonInline({ productId }: { productId: string }) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { user } = useAuth();
  const router = useRouter();
  const active = isInWishlist(productId);

  const handleClick = () => {
    if (!user) {
      router.push("/auth/login");
      return;
    }
    toggleWishlist(productId);
  };

  return (
    <motion.button
      onClick={handleClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`w-full flex items-center justify-center space-x-2 px-8 py-3 mb-8 border rounded-full font-light uppercase tracking-[0.15em] text-sm transition-all ${
        active
          ? "border-red-300 text-red-500 bg-red-50/50 hover:bg-red-50"
          : "border-cream-400 text-charcoal-700 hover:border-gold-400 hover:text-gold-700"
      }`}
    >
      <svg
        className="w-4 h-4"
        fill={active ? "currentColor" : "none"}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={active ? 0 : 1.5}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      <span>{active ? "Added to Wishlist" : "Add to Wishlist"}</span>
    </motion.button>
  );
}

export default function ProductDetailPage() {
  const params = useParams();
  const product = getProductById(params.id as string);
  const [selectedImage, setSelectedImage] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const { addToCart, stockLevels } = useCart();

  const productId = params.id as string;
  // Shared stock map from CartContext (null while loading)
  const stockQty = stockLevels === null ? null : stockLevels[productId] ?? 0;

  if (!product) {
    return (
      <div className="pt-32 pb-16 text-center bg-cream-50 min-h-screen">
        <h1 className="text-3xl font-serif text-charcoal-700 mb-4">
          Product Not Found
        </h1>
        <Link href="/collections" className="text-gold-600 hover:underline">
          ← Back to Collections
        </Link>
      </div>
    );
  }

  const related = getFeaturedProducts()
    .filter((p) => p.id !== product.id)
    .slice(0, 3);

  const whatsappMessage = encodeURIComponent(
    `Hi Geetika! I'm interested in the "${product.name}" (₹${product.price.toLocaleString("en-IN")}). Is it available?`
  );

  return (
    <div className="pt-28 pb-16 bg-cream-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center space-x-2 text-sm text-charcoal-700 mb-8"
        >
          <Link href="/" className="hover:text-gold-600 transition-colors">Home</Link>
          <span>/</span>
          <Link href="/collections" className="hover:text-gold-600 transition-colors">Collections</Link>
          <span>/</span>
          <span className="text-charcoal-800">{product.name}</span>
        </motion.div>

        {/* Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-24">
          {/* Images */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative aspect-square rounded-2xl overflow-hidden mb-4 glass-card shadow-lg cursor-zoom-in" onClick={() => setZoomOpen(true)}>
              <Image
                src={product.images[selectedImage]}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-500 hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
              {product.badge && (
                <div className="absolute top-4 left-4 px-4 py-2 glass-subtle text-charcoal-800 text-xs font-semibold uppercase tracking-[0.15em]">
                  {product.badge}
                </div>
              )}

              {/* Zoom indicator */}
              <div className="absolute top-4 right-4 w-9 h-9 rounded-full glass-subtle flex items-center justify-center text-charcoal-700 opacity-60 group-hover:opacity-100 transition-opacity pointer-events-none">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6M7 10h6" />
                </svg>
              </div>

              {/* Navigation Arrows */}
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedImage((prev) => (prev === 0 ? product.images.length - 1 : prev - 1)); }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full glass-subtle flex items-center justify-center text-charcoal-800 hover:bg-white/80 transition-all"
                    aria-label="Previous image"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedImage((prev) => (prev === product.images.length - 1 ? 0 : prev + 1)); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full glass-subtle flex items-center justify-center text-charcoal-800 hover:bg-white/80 transition-all"
                    aria-label="Next image"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}
            </div>

            {product.images.length > 1 && (
              <div className="flex space-x-3">
                {product.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImage === index
                        ? "border-gold-500 shadow-md"
                        : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} view ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {product.isNew && (
              <span className="inline-block px-3 py-1 bg-gold-600 text-white text-[10px] uppercase tracking-[0.15em] rounded-full mb-4">
                New Arrival
              </span>
            )}

            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl md:text-4xl font-serif text-charcoal-800">
                {product.name}
              </h1>
            </div>

            <div className="flex items-center space-x-4 mb-6">
              <span className="text-3xl font-medium text-charcoal-800">
                ₹{product.price.toLocaleString("en-IN")}
              </span>
              {product.originalPrice && (
                <>
                  <span className="text-xl text-charcoal-700 line-through">
                    ₹{product.originalPrice.toLocaleString("en-IN")}
                  </span>
                  <span className="px-3 py-1 bg-green-50 text-green-600 text-xs font-medium rounded-full">
                    {Math.round(
                      ((product.originalPrice - product.price) / product.originalPrice) * 100
                    )}% OFF
                  </span>
                </>
              )}
            </div>

            <p className="text-charcoal-800 leading-relaxed mb-8 font-light">
              {product.description}
            </p>

            <div className="mb-8">
              <h3 className="text-charcoal-700 font-medium uppercase tracking-[0.15em] text-xs mb-4">
                Product Details
              </h3>
              <ul className="space-y-2">
                {product.details.filter(d => !d.startsWith("Why You'll Love It")).map((detail, i) => (
                  <li key={i} className="flex items-start space-x-3 text-charcoal-800 text-sm font-light">
                    <span className="text-gold-500 mt-0.5">✦</span>
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>

              {/* Why You'll Love It */}
              {product.details.filter(d => d.startsWith("Why You'll Love It")).length > 0 && (
                <div className="mt-6 p-4 gradient-gold-soft rounded-xl border border-gold-400/15">
                  <h4 className="text-gold-700 font-semibold text-xs uppercase tracking-[0.15em] mb-2">
                    Why You&apos;ll Love It ✨
                  </h4>
                  <p className="text-charcoal-800 text-sm">
                    {product.details.find(d => d.startsWith("Why You'll Love It"))?.replace("Why You'll Love It: ", "")}
                  </p>
                </div>
              )}
            </div>

            {/* CTA Buttons */}
            {product && stockQty !== null && stockQty <= 0 ? (
              <div className="mb-8 py-4 text-center bg-red-50 rounded-xl border border-red-100">
                <p className="text-red-600 font-semibold uppercase tracking-[0.15em] text-sm">Out of Stock</p>
                <p className="text-charcoal-700 text-xs mt-1">This item is currently unavailable</p>
              </div>
            ) : (
            <>
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <motion.button
                onClick={() => product && addToCart(product)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 flex items-center justify-center space-x-3 px-8 py-4 bg-charcoal-800 text-white font-light uppercase tracking-[0.15em] text-sm hover:bg-gold-600 transition-colors rounded-full"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <span>Add to Bag</span>
              </motion.button>

              <Link href="/checkout" className="flex-1">
                <motion.span
                  onClick={() => product && addToCart(product)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center space-x-3 px-8 py-4 border border-gold-500 text-gold-700 font-light uppercase tracking-[0.15em] text-sm hover:bg-gold-500/10 transition-all rounded-full cursor-pointer"
                >
                  <span>Buy Now</span>
                </motion.span>
              </Link>
            </div>
            <WishlistButtonInline productId={product.id} />
            </>
            )}

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-cream-400">
              {[
                { icon: "✦", label: "Hand Curated" },
                { icon: "📦", label: "Secure Packaging" },
                { icon: "💎", label: "Premium Quality" },
              ].map((badge) => (
                <div key={badge.label} className="text-center">
                  <div className="text-xl mb-1">{badge.icon}</div>
                  <div className="text-charcoal-700 text-[10px] uppercase tracking-[0.15em]">
                    {badge.label}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl font-serif text-center mb-12 text-charcoal-800"
            >
              You May Also <span className="text-gold-gradient">Love</span>
            </motion.h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {related.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <ProductCard product={p} />
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Zoom Modal */}
      <AnimatePresence>
        {zoomOpen && product && (
          <ImageZoomModal
            src={product.images[selectedImage]}
            alt={product.name}
            onClose={() => setZoomOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
