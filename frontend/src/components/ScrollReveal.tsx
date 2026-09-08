"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "scale";
};

export default function ScrollReveal({
  children,
  className = "",
  delay = 0,
  direction = "up",
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => setVisible(true), delay);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  const base =
    "transition-all duration-700 cubic-bezier(0.16, 1, 0.3, 1) will-change-transform";
  const state = visible ? "visible" : "";

  const directionClasses: Record<string, string> = {
    up: visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10",
    down: visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10",
    left: visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10",
    right: visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10",
    scale: visible ? "opacity-100 scale-100" : "opacity-0 scale-95",
  };

  return (
    <div
      ref={ref}
      className={`${base} ${state} ${directionClasses[direction]} ${className}`}
    >
      {children}
    </div>
  );
}
