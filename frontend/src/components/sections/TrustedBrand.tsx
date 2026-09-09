"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";

const fadeUpVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

interface Brand {
  id: number;
  name: string;
  logo?: string;
  is_active: boolean;
}

export default function TrustedBrand() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await apiClient<{ brands: Brand[] }>("/brands");
        if (!cancelled) {
          setBrands((data.brands || []).filter((b) => b.is_active && b.logo));
        }
      } catch (err) {
        console.error("Failed to load brands:", err);
        if (!cancelled) setBrands([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading || brands.length === 0) {
    return null;
  }

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap"
        rel="stylesheet"
      />
      <section className="w-full bg-white flex justify-center items-center pt-[64px] pb-0 px-5">
        <motion.div
          className="w-full max-w-[1200px] text-center"
          variants={fadeUpVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          <h2 className="text-[#1b1a2f] text-[1.1rem] font-medium mb-[12px] tracking-[-0.01em]">
            Trusted by 120+ high-growth startups
          </h2>
          <div className="flex flex-wrap justify-center items-center gap-[20px] md:gap-[30px] lg:gap-[40px]">
            {brands.map((brand) => (
              <img
                key={brand.id}
                src={brand.logo}
                alt={brand.name}
                className="h-[24px] md:h-[28px] lg:h-[32px] w-auto max-w-[140px] grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all duration-300 ease-in-out cursor-pointer"
              />
            ))}
          </div>
        </motion.div>
      </section>
    </>
  );
}