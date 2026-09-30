"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CloudSun, MapPinned, MessagesSquare, ScanLine, Sprout } from "lucide-react";

import { Splash } from "@/components/layout/splash";
import { LANGUAGES, useLanguage } from "@/lib/language";
import { cn } from "@/lib/utils";

/**
 * Top-level navigation.
 *
 * Five destinations, named for what is inside them rather than for umbrella
 * words — "Home" tells a farmer nothing, "My Farm" tells them exactly whose
 * land they are about to look at. Tabs navigate and never act
 * (`tab-bars.md › Best practices`).
 *
 * The bar is a translucent floating layer with content scrolling beneath it,
 * and it sits at the bottom on touch widths so the primary destinations stay
 * inside one-handed reach.
 */
const TABS = [
  { href: "/", label: "My Farm", Icon: Sprout },
  { href: "/weather", label: "Weather", Icon: CloudSun },
  { href: "/scan", label: "Scan", Icon: ScanLine },
  { href: "/districts", label: "Districts", Icon: MapPinned },
  { href: "/assistant", label: "Ask", Icon: MessagesSquare },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { language, setLanguage } = useLanguage();

  return (
    <div className="min-h-dvh flex flex-col">
      <Splash />

      {/* Masthead in crop green, so the app reads as agricultural at a glance
          and the phone's status bar tints to match. The language control lives
          here rather than per screen: choosing Hindi on the advisory used to
          leave the assistant and the scheme list in English. */}
      <header className="bg-accent text-accent-content">
        <div className="mx-auto flex w-full max-w-screen-2xl items-center gap-3 px-4 py-3.5 md:px-8">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/25">
            <Sprout aria-hidden className="size-5" strokeWidth={2} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="type-heading leading-tight">AgriMitra</p>
            {/* The four language controls leave little room at 375px, where the
                strapline wrapped to three lines. It returns once there is space. */}
            <p className="type-caption hidden truncate leading-tight opacity-85 min-[420px]:block">
              Climate-smart farming assistant
            </p>
          </div>

          <div role="radiogroup" aria-label="Language" className="flex gap-1">
            {LANGUAGES.map((option) => (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={language === option.value}
                aria-label={option.label}
                onClick={() => setLanguage(option.value)}
                className={cn(
                  "min-h-tap min-w-tap rounded-md px-2 type-caption font-semibold transition-colors",
                  language === option.value
                    ? "bg-white/25 ring-1 ring-white/40"
                    : "opacity-75 hover:bg-white/10",
                )}
              >
                {option.short}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main id="main" className={cn(
        "w-full px-4 md:px-8 transition-colors duration-500 flex-1 flex flex-col",
        pathname === "/onboarding" ? "py-4 bg-slate-50 dark:bg-[#0e160f]" : "pb-32 pt-6 min-h-dvh bg-gradient-to-br from-surface to-surface-sunken"
      )}>
        <div className="max-w-screen-2xl mx-auto w-full h-full flex-1 flex flex-col">
          {children}
        </div>
      </main>

      {pathname !== "/onboarding" && (
        <nav
          aria-label="Primary"
          className="material-chrome fixed inset-x-0 bottom-0 z-40 border-t border-white/10 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_24px_rgba(0,0,0,0.05)]"
        >
          <ul className="mx-auto flex max-w-screen-2xl items-stretch justify-around px-4 md:px-8">
            {TABS.map(({ href, label, Icon }) => {
              const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
              return (
                <li key={href} className="flex-1">
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex min-h-tap flex-col items-center justify-center gap-1 rounded-md py-2",
                      "transition-colors duration-150",
                      active ? "text-accent" : "text-content-tertiary hover:text-content-secondary",
                    )}
                  >
                    <Icon
                      aria-hidden
                      className="size-6"
                      // Weight matches the label beside it; the active tab reads heavier.
                      strokeWidth={active ? 2.25 : 1.75}
                    />
                    <span className="type-caption font-medium">{label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </div>
  );
}
