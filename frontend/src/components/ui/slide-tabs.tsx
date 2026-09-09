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
  const [uncontrolledSelected, setUncontrolledSelected] = useState(0);
  const tabsRef = useRef<(HTMLLIElement | null)[]>([]);

  const isControlled = controlledSelectedIndex !== undefined;
  const selected = isControlled ? controlledSelectedIndex : uncontrolledSelected;
  const setSelected = isControlled ? onSelect ?? (() => {}) : setUncontrolledSelected;

  useEffect(() => {
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
      {tabs.map((tab, i) => (
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
          onClick={() => {
            setSelected(i);
            tab.onClick?.();
          }}
          className="relative z-10 block cursor-pointer px-3 py-1.5 text-xs uppercase text-white mix-blend-difference md:px-5 md:py-3 md:text-base"
        >
          {tab.label}
        </li>
      ))}

      <Cursor position={position} />
    </ul>
  );
};


const Cursor = ({ position }: { position: TabPosition }) => {
  return (
    <motion.li
      animate={{
        ...position,
      }}
      className="absolute z-0 h-7 rounded-full bg-black dark:bg-white md:h-12"
    />
  );
};