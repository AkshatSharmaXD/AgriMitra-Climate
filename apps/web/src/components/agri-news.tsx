"use client";

import { useQuery } from "@tanstack/react-query";
import { ExternalLink, Newspaper } from "lucide-react";

import { Card, CardHeader } from "@/components/ui/card";
import { ProvenanceBadge } from "@/components/ui/provenance-badge";
import { EmptyState, Skeleton } from "@/components/ui/states";
import { api } from "@/lib/api";

/**
 * Agricultural headlines.
 *
 * Every item is a real article from a named publisher with a real publication
 * time and a working link. The screen this replaces carried three hardcoded
 * stories attributed to publications that do not exist, timestamped "2 hours
 * ago" in perpetuity (audit A3). When the feed is down, this renders nothing
 * of substance rather than filling the space.
 */
function relativeTime(iso: string | null): string | null {
  if (!iso) return null;
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return null;

  const minutes = Math.round((Date.now() - then) / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;

  const days = Math.round(hours / 24);
  return days === 1 ? "yesterday" : `${days} days ago`;
}

export function AgriNews({ limit = 5 }: { limit?: number }) {
  const news = useQuery({
    queryKey: ["news"],
    queryFn: () => api.getNews(),
    retry: false,
    staleTime: 30 * 60_000,
  });

  if (news.isError) {
    return (
      <Card>
        <CardHeader title="Agriculture news" />
        <EmptyState
          icon={Newspaper}
          title="Headlines unavailable"
          description="The news feed could not be reached just now. Nothing is shown rather than something out of date."
        />
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        title="Agriculture news"
        action={
          news.data ? (
            <ProvenanceBadge provenance="live" label={news.data.publisher} />
          ) : null
        }
      />

      {news.isPending ? (
        <div className="space-y-3">
          {[0, 1, 2].map((index) => (
            <Skeleton key={index} className="h-16 w-full" />
          ))}
        </div>
      ) : (
        <ul className="divide-y divide-hairline">
          {news.data!.items.slice(0, limit).map((item) => {
            const when = relativeTime(item.published_at);
            return (
              <li key={item.link}>
                <a
                  href={item.link}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="group flex gap-3 py-3.5"
                >
                  <span
                    aria-hidden
                    className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent"
                  >
                    <Newspaper className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="type-callout block font-medium text-content group-hover:text-accent">
                      {item.title}
                    </span>
                    <span className="type-caption mt-1 flex flex-wrap items-center gap-x-2 text-content-tertiary">
                      <span>{item.publisher}</span>
                      {when ? (
                        <>
                          <span aria-hidden>·</span>
                          {/* A real timestamp, from the article itself. */}
                          <time dateTime={item.published_at ?? undefined}>{when}</time>
                        </>
                      ) : null}
                    </span>
                  </span>
                  <ExternalLink
                    aria-hidden
                    className="mt-1 size-4 shrink-0 text-content-tertiary"
                  />
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
