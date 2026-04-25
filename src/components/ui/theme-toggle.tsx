"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Avoid hydration mismatch — render empty placeholder until mounted
  if (!mounted) {
    return <div className="w-9 h-9 border border-[#E5E5E5] dark:border-[#2a2a2a]" />;
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Passer en mode clair" : "Passer en mode sombre"}
      className="relative flex items-center justify-center w-9 h-9 border border-[#E5E5E5] dark:border-[#2a2a2a] text-[#888888] hover:text-[#FF7A00] hover:border-[#FF7A00]/40 dark:text-[#555555] dark:hover:text-[#FF7A00] transition-colors"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={isDark ? "moon" : "sun"}
          initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
          transition={{ duration: 0.18, ease: "easeInOut" }}
        >
          {isDark ? <Moon size={14} /> : <Sun size={14} />}
        </motion.div>
      </AnimatePresence>
    </button>
  );
}
