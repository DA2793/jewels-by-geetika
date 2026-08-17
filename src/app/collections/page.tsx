"use client";

import { Suspense, useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { products, categories, Category, getShuffledProducts } from "@/data/products";
import ProductCard from "@/components/ProductCard";

function CollectionsContent() {
  const searchParams = useSearchParams();
  const [activeCategory, setActiveCategory] = useState<Category | "all">("all");
  const [showNewOnly, setShowNewOnly] = useState(false);
  const [showBestsellers, setShowBestsellers] = useState(false);
  const [sortBy, setSortBy] = useState<"default" | "price-low" | "price-high">("default");
  const [displayProducts, setDisplayProducts] = useState(products);

  // Shuffle after mount to avoid hydration mismatch with the prerendered page
  useEffect(() => {
    setDisplayProducts(getShuffledProducts());
  }, []);

  useEffect(() => {
    const cat = searchParams.get("category") as Category | null;
    const filter = searchParams.get("filter");
    if (cat) setActiveCategory(cat);
    if (filter === "new") setShowNewOnly(true);
    if (filter === "bestsellers") setShowBestsellers(true);
  }, [searchParams]);

  const filteredProducts = useMemo(() => {
    let filtered =
      activeCategory === "all"
        ? displayProducts
        : displayProducts.filter((p) => p.category === activeCategory || p.categories?.includes(activeCategory));

    if (showNewOnly) {
      filtered = filtered.filter((p) => p.isNew);
    }

    if (showBestsellers) {
      filtered = filtered.filter((p) => p.isBestseller);
    }

    if (sortBy === "price-low") {
      filtered = [...filtered].sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      filtered = [...filtered].sort((a, b) => b.price - a.price);
    }

    return filtered;
  }, [displayProducts, activeCategory, showNewOnly, showBestsellers, sortBy]);

  return (
    <>
      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="flex flex-col md:flex-row justify-between items-center mb-12 space-y-4 md:space-y-0"
      >
        <div className="flex flex-wrap justify-center gap-2">
          <button
            onClick={() => { setActiveCategory("all"); setShowNewOnly(false); setShowBestsellers(false); }}
            className={`px-5 py-2 text-xs uppercase tracking-[0.15em] transition-all duration-300 rounded-full ${
              activeCategory === "all" && !showNewOnly
                ? "bg-charcoal-800 text-white"
                : "bg-white text-charcoal-700 hover:bg-charcoal-50 border border-charcoal-100"
            }`}
          >
            All
          </button>
          <button
            onClick={() => { setShowNewOnly(!showNewOnly); setShowBestsellers(false); setActiveCategory("all"); }}
            className={`px-5 py-2 text-xs uppercase tracking-[0.15em] transition-all duration-300 rounded-full ${
              showNewOnly
                ? "bg-gold-600 text-white"
                : "bg-white text-charcoal-700 hover:bg-charcoal-50 border border-charcoal-100"
            }`}
          >
            ✦ New In
          </button>
          <button
            onClick={() => { setShowBestsellers(!showBestsellers); setShowNewOnly(false); setActiveCategory("all"); }}
            className={`px-5 py-2 text-xs uppercase tracking-[0.15em] transition-all duration-300 rounded-full ${
              showBestsellers
                ? "bg-gold-600 text-white"
                : "bg-white text-charcoal-700 hover:bg-charcoal-50 border border-charcoal-100"
            }`}
          >
            ✦ Bestsellers
          </button>
          {categories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => { setActiveCategory(cat.slug); setShowNewOnly(false); setShowBestsellers(false); }}
              className={`px-5 py-2 text-xs uppercase tracking-[0.15em] transition-all duration-300 rounded-full ${
                activeCategory === cat.slug
                  ? "bg-charcoal-800 text-white"
                  : "bg-white text-charcoal-700 hover:bg-charcoal-50 border border-charcoal-100"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="bg-white border border-charcoal-100 text-charcoal-700 px-4 py-2 text-sm rounded-full focus:outline-none focus:border-gold-400"
        >
          <option value="default">Sort by: Default</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
        </select>
      </motion.div>

      {/* Products Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory + String(showNewOnly) + sortBy}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8"
        >
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {filteredProducts.length === 0 && (
        <div className="text-center py-20">
          <p className="text-charcoal-700 text-lg font-light">
            No products found in this category yet. Check back soon!
          </p>
        </div>
      )}
    </>
  );
}

export default function CollectionsPage() {
  return (
    <div className="pt-28 pb-16 bg-cream-50 min-h-screen">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center px-4 mb-12"
      >
        <span className="text-gold-700 font-medium uppercase tracking-[0.3em] text-xs font-light">
          Explore
        </span>
        <h1 className="text-4xl md:text-6xl font-serif mt-4 mb-4 text-charcoal-800">
          Our <span className="text-gold-gradient">Collections</span>
        </h1>
        <p className="text-charcoal-800 max-w-lg mx-auto font-light">
          Each piece is hand-curated to bring you the finest in jewellery. Find your perfect match.
        </p>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Suspense
          fallback={
            <div className="text-center py-20">
              <div className="inline-block w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
            </div>
          }
        >
          <CollectionsContent />
        </Suspense>
      </div>
    </div>
  );
}
