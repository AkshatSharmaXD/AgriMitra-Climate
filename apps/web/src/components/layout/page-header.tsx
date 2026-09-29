import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export function PageHeader({
  title,
  description,
  backHref,
  provenance,
}: {
  title: string;
  description?: string;
  backHref?: string;
  provenance?: React.ReactNode;
}) {
  return (
    <header className="mb-6 space-y-3 pt-2">
      {backHref ? (
        <Link
          href={backHref}
          className="inline-flex min-h-tap items-center gap-1 -ml-1 type-callout font-medium text-accent"
        >
          <ChevronLeft aria-hidden className="size-4" />
          Back
        </Link>
      ) : null}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="type-title text-content">{title}</h1>
        {provenance}
      </div>
      {description ? (
        <p className="type-body text-content-secondary">{description}</p>
      ) : null}
    </header>
  );
}
