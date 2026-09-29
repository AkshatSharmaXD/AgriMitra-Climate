"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Leaf, MessagesSquare, ScanLine, Sun } from "lucide-react";

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
  { href: "/", label: "My Farm", Icon: Leaf },
  { href: "/weather", label: "Weather", Icon: Sun },
  { href: "/scan", label: "Scan", Icon: ScanLine },
  { href: "/districts", label: "Districts", Icon: Compass },
  { href: "/assistant", label: "Ask", Icon: MessagesSquare },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-dvh">
      <main id="main" className="mx-auto w-full max-w-2xl px-4 pb-28 pt-4 lg:max-w-5xl">
        {children}
      </main>

      <nav
        aria-label="Primary"
        className="material-chrome fixed inset-x-0 bottom-0 z-40 border-t border-hairline pb-[env(safe-area-inset-bottom)]"
      >
        <ul className="mx-auto flex max-w-2xl items-stretch justify-around px-2">
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
    </div>
  );
}
