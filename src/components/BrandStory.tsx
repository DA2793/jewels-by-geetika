"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const stats = [
  { number: "✦", label: "Quality Assured" },
  { number: "100%", label: "Handcrafted" },
  { number: "✦", label: "Made in India" },
];

export default function BrandStory() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const leftX = useTransform(scrollYProgress, [0, 0.5], [-60, 0]);
  const rightX = useTransform(scrollYProgress, [0, 0.5], [60, 0]);
  const sectionOpacity = useTransform(scrollYProgress, [0, 0.3], [0, 1]);

  return (
    <section ref={sectionRef} className="py-28 px-4 sm:px-6 lg:px-8 gradient-champagne overflow-hidden">
      <motion.div style={{ opacity: sectionOpacity }} className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left - Image Collage */}
          <motion.div style={{ x: leftX }} className="relative">
            <div className="grid grid-cols-2 gap-4">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="aspect-[3/4] rounded-2xl overflow-hidden mt-8 shadow-xl"
              >
                <div
                  className="w-full h-full bg-cover bg-center"
                  style={{
                    backgroundImage:
                      "url('/products/Saanjh/saanjh-3.webp')",
                  }}
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="aspect-[3/4] rounded-2xl overflow-hidden shadow-xl"
              >
                <div
                  className="w-full h-full bg-cover bg-center"
                  style={{
                    backgroundImage:
                      "url('/products/Adaa/adaa-3.webp')",
                  }}
                />
              </motion.div>
            </div>
            {/* Gold accent */}
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-24 h-[2px] gold-shimmer rounded-full" />
          </motion.div>

          {/* Right - Text Content */}
          <motion.div style={{ x: rightX }}>
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-gold-700 font-medium uppercase tracking-[0.3em] text-xs font-light"
            >
              Our Story
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-5xl font-serif mt-4 mb-8 text-charcoal-800"
            >
              Crafted with{" "}
              <span className="text-gold-gradient">Passion</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-charcoal-800 leading-relaxed mb-6 font-light"
            >
              Jewels by Geetika was born from a love for beautiful jewellery and
              the belief that every woman deserves to feel extraordinary. Each
              piece in our collection is hand-curated, blending traditional
              Indian craftsmanship with contemporary design.
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-charcoal-800 leading-relaxed mb-12 font-light"
            >
              From stunning AD diamond pieces to regal kundan sets and elegant
              gold replicas, we bring you jewellery that looks and feels like
              luxury — without the luxury price tag.
            </motion.p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-3xl md:text-4xl font-serif text-gold-600 mb-1">
                    {stat.number}
                  </div>
                  <div className="text-charcoal-700 text-[10px] uppercase tracking-[0.2em]">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
