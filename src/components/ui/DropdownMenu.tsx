"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/utils/cn";

type DropdownItem = {
  id: string;
  label: string;
  onSelect?: () => void;
};

export function DropdownMenu({
  triggerLabel,
  items,
  className,
}: {
  triggerLabel: string;
  items: DropdownItem[];
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (!rootRef.current) {
        return;
      }

      const target = event.target;
      if (target instanceof Node && !rootRef.current.contains(target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("keydown", onKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className={cn("relative", className)} ref={rootRef}>
      <button
        aria-expanded={open}
        aria-haspopup="menu"
        className="inline-flex h-9 items-center gap-2 rounded-md border border-border px-3 text-sm text-foreground transition-colors duration-150 hover:bg-muted"
        onClick={() => setOpen((previous) => !previous)}
        type="button"
      >
        <span>{triggerLabel}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.16 }}>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </motion.span>
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="absolute right-0 z-40 mt-2 w-44 rounded-md border border-border bg-background py-1"
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.14, ease: [0.2, 0.8, 0.2, 1] }}
          >
            {items.map((item) => (
              <button
                className="flex w-full items-center px-3 py-2 text-left text-sm text-foreground transition-colors duration-150 hover:bg-muted"
                key={item.id}
                onClick={() => {
                  item.onSelect?.();
                  setOpen(false);
                }}
                type="button"
              >
                {item.label}
              </button>
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
