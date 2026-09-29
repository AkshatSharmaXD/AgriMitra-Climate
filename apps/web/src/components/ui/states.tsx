import { CloudOff, Inbox, TriangleAlert } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

/** Shaped like the content that is arriving, so the layout does not jump. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("animate-pulse rounded-md bg-surface-sunken", className)}
    />
  );
}

export function EmptyState({
  title,
  description,
  action,
  icon: Icon = Inbox,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
  icon?: React.ElementType;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-hairline px-6 py-10 text-center">
      <Icon aria-hidden className="size-7 text-content-tertiary" strokeWidth={1.5} />
      <div>
        <p className="type-heading text-content">{title}</p>
        <p className="type-callout mx-auto mt-1 max-w-sm text-content-secondary">
          {description}
        </p>
      </div>
      {action}
    </div>
  );
}

/**
 * Says what broke and what it means for what is on screen.
 * Never "Something went wrong" — that tells a farmer nothing.
 */
export function ErrorState({
  title,
  detail,
  action,
  variant = "error",
}: {
  title: string;
  detail: string;
  action?: React.ReactNode;
  variant?: "error" | "offline";
}) {
  const Icon = variant === "offline" ? CloudOff : TriangleAlert;
  return (
    <div
      role="status"
      className="flex items-start gap-3 rounded-md border border-risk-high/25 bg-risk-high-wash p-4"
    >
      <Icon aria-hidden className="mt-0.5 size-5 shrink-0 text-risk-high" strokeWidth={2} />
      <div className="min-w-0 flex-1">
        <p className="type-callout font-semibold text-risk-high">{title}</p>
        <p className="type-callout mt-1 text-content-secondary">{detail}</p>
        {action ? <div className="mt-3">{action}</div> : null}
      </div>
    </div>
  );
}
