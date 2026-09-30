import * as React from "react";

import { cn } from "@/lib/utils";

/** A flat surface with a hairline. No gradient, no glow — the boldness in this
 *  design is spent on RiskStratum and nowhere else. */
export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-[24px] glass-card p-7 transition-all duration-500 ease-out hover:-translate-y-1.5 hover:shadow-2xl hover:border-white/60 dark:hover:border-white/20 group",
        className,
      )}
      {...props}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent dark:from-white/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none" />
      {props.children}
    </section>
  );
}

export function CardHeader({
  title,
  description,
  action,
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("mb-4 flex items-start justify-between gap-3", className)}>
      <div className="min-w-0">
        <h2 className="type-heading text-content">{title}</h2>
        {description ? (
          <p className="type-callout mt-1 text-content-secondary">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}
