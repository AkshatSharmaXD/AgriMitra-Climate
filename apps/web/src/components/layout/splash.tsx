"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Wheat, Sprout, Sparkles } from "lucide-react";
import * as React from "react";

/**
 * Animated Grains & Crop Splash Screen for AgriMitra Climate.
 *
 * Displays an animated crop loading widget with rotating grain indicators
 * every time the application is opened or refreshed.
 */
export function Splash() {
  const reduceMotion = useReducedMotion();
  const [visible, setVisible] = React.useState(true);
  const [mounted, setMounted] = React.useState(false);
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    setMounted(true);
    setVisible(true);

    // Smooth loading progress bar simulation
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.floor(Math.random() * 25) + 15;
      });
    }, 120);

    // Readiness: dismiss after brief animation
    const timer = setTimeout(() => {
      setVisible(false);
    }, 1500);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, []);

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          key="splash"
          role="status"
          aria-label="AgriMitra Climate is loading"
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-br from-emerald-900 via-green-950 to-stone-950 text-white select-none px-4"
          initial={{ opacity: 1 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.45, ease: "easeInOut" }}
        >
          {/* Subtle background glow effect */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.15)_0%,transparent_70%)] pointer-events-none" />

          <motion.div
            className="relative flex flex-col items-center gap-6 text-center max-w-sm"
            initial={reduceMotion ? false : { opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Animated Grain & Crop Logo Widget */}
            <div className="relative flex items-center justify-center">
              {/* Outer Rotating Grain Ring */}
              <motion.div
                className="absolute size-32 rounded-full border-2 border-dashed border-emerald-400/40"
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              />

              {/* Pulsing Outer Glow Ring */}
              <motion.div
                className="absolute size-28 rounded-full bg-emerald-500/20 blur-md"
                animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />

              {/* Central Badge with Wheat/Sprout Icon */}
              <div className="relative size-24 rounded-2xl bg-gradient-to-tr from-emerald-600 to-amber-500 p-0.5 shadow-2xl shadow-emerald-900/50">
                <div className="flex size-full items-center justify-center rounded-[14px] bg-stone-900/90 backdrop-blur-sm">
                  <motion.div
                    animate={{ scale: [0.95, 1.05, 0.95] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                    className="relative flex items-center justify-center text-amber-400"
                  >
                    <Wheat className="size-12 stroke-[1.75]" />
                    <Sprout className="absolute -bottom-1 -right-1 size-5 text-emerald-400" />
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Title & Description */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-white font-display">
                  AgriMitra Climate
                </h1>
                <Sparkles className="size-4 text-amber-400 animate-pulse" />
              </div>
              <p className="text-sm font-medium text-emerald-200/80">
                AI-Powered Climate-Smart Agriculture
              </p>
            </div>

            {/* Grain Loading Progress Bar */}
            <div className="w-full space-y-2 pt-2">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-stone-800/80 p-0.5">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-amber-400 to-emerald-300"
                  initial={{ width: "0%" }}
                  animate={{ width: `${Math.min(progress, 100)}%` }}
                  transition={{ ease: "easeOut", duration: 0.2 }}
                />
              </div>
              <p className="text-xs font-mono tracking-wider text-stone-400 uppercase">
                Loading Farm Signals...
              </p>
            </div>
          </motion.div>

          <footer className="absolute bottom-8 flex items-center gap-2 text-xs font-medium text-stone-400">
            <span>Made in India</span>
            <span>🇮🇳</span>
          </footer>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
