"use client";

import Link from "next/link";
import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";

interface TabPosition {
  left: number;
  width: number;
  opacity: number;
}

interface TabItem {
  label: string;
  href?: string;
  external?: boolean;
  onClick?: () => void;
}

interface SlideTabsProps {
  tabs: TabItem[];
  selectedIndex?: number;
  onSelect?: (index: number) => void;
  className?: string;
}

export const SlideTabs = ({
  tabs,
  selectedIndex: controlledSelectedIndex,
  onSelect,
  className = "relative mx-auto flex w-fit rounded-full border-2 border-black bg-white p-1 dark:border-white dark:bg-neutral-800"
}: SlideTabsProps) => {
  const [position, setPosition] = useState<TabPosition>({
    left: 0,
    width: 0,
    opacity: 0,
  });
  const tabsRef = useRef<(HTMLLIElement | null)[]>([]);

  // -1 = nothing selected (e.g. home / login pages).
  const selected = controlledSelectedIndex ?? -1;

  useEffect(() => {
    if (selected < 0) {
      setPosition((prev) => ({ ...prev, opacity: 0 }));
      return;
    }
    const selectedTab = tabsRef.current[selected];
    if (selectedTab) {
      const { width } = selectedTab.getBoundingClientRect();
      setPosition({
        left: selectedTab.offsetLeft,
        width,
        opacity: 1,
      });
    }
  }, [selected]);

  return (
    <ul
      onMouseLeave={() => {
        if (selected < 0) {
          setPosition((prev) => ({ ...prev, opacity: 0 }));
          return;
        }
        const selectedTab = tabsRef.current[selected];
        if (selectedTab) {
          const { width } = selectedTab.getBoundingClientRect();
          setPosition({
            left: selectedTab.offsetLeft,
            width,
            opacity: 1,
          });
        }
      }}
      className={className}
    >
      {tabs.map((tab, i) => {
        const innerClassName =
          "block px-3 py-1.5 text-xs uppercase md:px-5 md:py-3 md:text-base";
        return (
        <li
          key={tab.label}
          ref={(el) => {
            tabsRef.current[i] = el;
          }}
          onMouseEnter={() => {
            const el = tabsRef.current[i];
            if (!el) return;
            const { width } = el.getBoundingClientRect();
            setPosition({
              left: el.offsetLeft,
              width,
              opacity: 1,
            });
          }}
          // NOTE: no onClick on the <li> when the tab is a link — the inner
          // <Link>/<a>/<button> handles navigation natively. Attaching a second
          // handler on the <li> only risks swallowing the click.
          onClick={
            tab.href
              ? undefined
              : () => {
                  onSelect?.(i);
                  tab.onClick?.();
                }
          }
          className="relative z-10 block cursor-pointer"
        >
          {tab.href ? (
            tab.external ? (
              <a
                href={tab.href}
                onClick={() => onSelect?.(i)}
                className={`${innerClassName} text-inherit hover:text-inherit focus:text-inherit visited:text-inherit no-underline`}
              >
                {tab.label}
              </a>
            ) : (
              <Link
                href={tab.href}
                onClick={() => onSelect?.(i)}
                className={`${innerClassName} text-inherit hover:text-inherit focus:text-inherit visited:text-inherit no-underline`}
              >
                {tab.label}
              </Link>
            )
          ) : (
            <button
              type="button"
              onClick={() => {
                onSelect?.(i);
                tab.onClick?.();
              }}
              className={`${innerClassName} text-inherit`}
            >
              {tab.label}
            </button>
          )}
        </li>
        );
      })}

      <Cursor position={position} />
    </ul>
  );
};


const Cursor = ({ position }: { position: TabPosition }) => {
  return (
    <motion.li
      aria-hidden="true"
      animate={{
        ...position,
      }}
      style={{ pointerEvents: "none" }}
      className="pointer-events-none absolute z-0 h-7 rounded-full bg-black dark:bg-white md:h-12"
    />
  );
};
