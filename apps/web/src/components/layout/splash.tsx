"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Sprout } from "lucide-react";
import * as React from "react";

/**
 * Brand splash on cold start.
 *
 * The version this replaces held the interface hostage for a fixed 2.8 seconds
 * with `setTimeout`, which is latency dressed as branding — `launching.md` is
 * explicit that an app should launch instantly. This one is tied to readiness,
 * not to a clock: it clears as soon as the first paint and the web fonts have
 * settled, with a short floor so it reads as intentional rather than as a
 * flash, and a hard ceiling so a slow font load can never trap anyone.
 *
 * It shows once per browser session, so moving between screens never replays it.
 */
const SESSION_KEY = "agrimitra.splashShown";
const MIN_VISIBLE_MS = 550;
const MAX_VISIBLE_MS = 1800;

export function Splash() {
  const reduceMotion = useReducedMotion();
  const [visible, setVisible] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);

    let alreadyShown = false;
    try {
      alreadyShown = window.sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {
      /* private mode — treat as not shown */
    }
    if (alreadyShown) return;

    setVisible(true);
    try {
      window.sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      /* non-fatal */
    }

    const shownAt = performance.now();

    const dismiss = () => {
      const remaining = Math.max(0, MIN_VISIBLE_MS - (performance.now() - shownAt));
      setTimeout(() => setVisible(false), remaining);
    };

    // Readiness, not a fixed wait: whichever of these arrives first wins.
    const ready = document.fonts?.ready ?? Promise.resolve();
    ready.then(dismiss).catch(dismiss);
    const ceiling = setTimeout(() => setVisible(false), MAX_VISIBLE_MS);

    return () => clearTimeout(ceiling);
  }, []);

  // Never render on the server: the markup would be in the HTML and would flash
  // for anyone who has already seen it this session.
  if (!mounted) return null;

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          key="splash"
          role="status"
          aria-label="AgriMitra is starting"
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-accent text-accent-content"
          initial={false}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 1.04 }}
          transition={
            reduceMotion
              ? { duration: 0.15 }
              : { type: "spring", bounce: 0, duration: 0.45 }
          }
        >
          <motion.div
            className="flex flex-col items-center gap-5"
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", bounce: 0, duration: 0.5 }}
          >
            <span className="flex size-24 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/25">
              <Sprout aria-hidden className="size-12" strokeWidth={1.75} />
            </span>
            <div className="text-center">
              <p className="type-display leading-none">AgriMitra</p>
              <p className="type-callout mt-2 opacity-85">
                Climate-smart farming assistant
              </p>
            </div>
          </motion.div>

          <p className="type-caption absolute bottom-10 opacity-75">Made in India 🇮🇳</p>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
