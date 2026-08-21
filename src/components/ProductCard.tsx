"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { useState, useRef, useEffect } from "react";
import WishlistButton from "./WishlistButton";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart, stockLevels } = useCart();
  const [limitMessage, setLimitMessage] = useState("");
  const limitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Shared stock map from CartContext — no per-card queries.
  // null = still loading → don't show "Sold Out" prematurely.
  const outOfStock = stockLevels !== null && (stockLevels[product.id] ?? 0) <= 0;

  useEffect(() => {
    return () => {
      if (limitTimer.current) clearTimeout(limitTimer.current);
    };
  }, []);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock) return;
    const result = addToCart(product);
    if (result === "stock-limit") {
      setLimitMessage("Max quantity already in bag");
      if (limitTimer.current) clearTimeout(limitTimer.current);
      limitTimer.current = setTimeout(() => setLimitMessage(""), 2500);
    }
  };

  return (
    <Link href={`/product/${product.id}`}>
      <motion.div
        whileHover={{ y: -6 }}
        className="group cursor-pointer"
      >
        {/* Image Container */}
        <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-cream-200 mb-4 shadow-sm">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />

          {/* Subtle overlay on hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />

          {/* Badge */}
          {product.badge && (
            <div className="absolute top-4 left-4 px-3 py-1.5 glass-subtle text-charcoal-800 text-[10px] font-semibold uppercase tracking-[0.15em]">
              {product.badge}
            </div>
          )}
          {product.isNew && !product.badge && (
            <div className="absolute top-4 left-4 px-3 py-1.5 bg-gold-600 text-white text-[10px] font-semibold uppercase tracking-[0.15em] rounded-full">
              New
            </div>
          )}

          {/* Wishlist — always visible on touch, hover-reveal on pointer devices */}
          <div className="absolute top-4 right-4 z-10 opacity-100 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100 transition-opacity duration-300">
            <WishlistButton productId={product.id} size="sm" />
          </div>

          {/* Sold Out Badge */}
          {outOfStock && (
            <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-charcoal-800/80 text-white text-[10px] font-semibold uppercase tracking-[0.15em] rounded-full backdrop-blur-sm">
              Sold Out
            </div>
          )}

          {/* Stock limit feedback */}
          {limitMessage && (
            <div className="absolute bottom-16 left-4 right-4 text-center py-2 bg-charcoal-800/90 text-white text-[11px] uppercase tracking-wider rounded-full backdrop-blur-sm" role="status">
              {limitMessage}
            </div>
          )}

          {/* Add to Bag — always visible on touch, hover-reveal on pointer devices */}
          {!outOfStock && (
          <div className="absolute bottom-4 left-4 right-4 opacity-100 translate-y-0 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100 md:translate-y-2 md:group-hover:translate-y-0 transition-all duration-500">
            <button
              onClick={handleAddToCart}
              aria-label={`Add ${product.name} to bag`}
              className="block w-full text-center py-3 glass-subtle text-xs font-medium uppercase tracking-[0.15em] transition-colors text-charcoal-800 hover:bg-charcoal-800 hover:text-white"
            >
              Add to Bag
            </button>
          </div>
          )}
        </div>

        {/* Info */}
        <div className="px-1">
          <h3 className="text-charcoal-700 font-serif text-lg mb-1 group-hover:text-gold-600 transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center space-x-3">
            <span className="text-charcoal-800 font-medium">
              ₹{product.price.toLocaleString("en-IN")}
            </span>
            {product.originalPrice && (
              <span className="text-charcoal-700 line-through text-sm">
                ₹{product.originalPrice.toLocaleString("en-IN")}
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
