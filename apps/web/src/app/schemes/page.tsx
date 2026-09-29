"use client";

import { useQuery } from "@tanstack/react-query";
import * as React from "react";
import { ExternalLink, Search, Sprout } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProvenanceBadge } from "@/components/ui/provenance-badge";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/states";
import { api } from "@/lib/api";
import { useLanguage } from "@/lib/language";

export default function SchemesPage() {
  const { language } = useLanguage();
  const [query, setQuery] = React.useState("");
  const [submitted, setSubmitted] = React.useState("");
  const [state, setState] = React.useState<string>("");

  const schemes = useQuery({
    queryKey: ["schemes", state, submitted, language],
    queryFn: () => api.getSchemes({ state: state || undefined, q: submitted || undefined, language }),
    staleTime: 60 * 60_000,
  });

  return (
    <div className="space-y-4">
      <PageHeader
        title="Government schemes"
        description="Subsidies and support you may be eligible for."
      />

      <form
        onSubmit={(event) => {
          event.preventDefault();
          setSubmitted(query.trim());
        }}
        className="flex gap-2"
      >
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search schemes"
          aria-label="Search schemes"
          className="min-h-tap flex-1 rounded-md border border-hairline bg-surface-raised px-3.5 type-body text-content placeholder:text-content-tertiary focus:border-accent"
        />
        <Button type="submit" size="icon" aria-label="Search">
          <Search aria-hidden className="size-5" />
        </Button>
      </form>

      {schemes.data && schemes.data.states_available.length > 0 ? (
        <div role="radiogroup" aria-label="State" className="flex flex-wrap gap-2">
          <Button
            role="radio"
            aria-checked={state === ""}
            variant={state === "" ? "primary" : "secondary"}
            onClick={() => setState("")}
          >
            National
          </Button>
          {schemes.data.states_available.map((name) => (
            <Button
              key={name}
              role="radio"
              aria-checked={state === name}
              variant={state === name ? "primary" : "secondary"}
              onClick={() => setState(name)}
            >
              {name}
            </Button>
          ))}
        </div>
      ) : null}

      {/* Requesting Hindi does not guarantee Hindi: Cloud Translation may be
          off. The badge reports what actually came back. */}
      {schemes.data && language !== "en" && schemes.data.language === "en" ? (
        <ProvenanceBadge
          provenance="unavailable"
          label="Shown in English"
          detail="translation not enabled on this server"
        />
      ) : null}

      {schemes.isPending ? (
        <div className="space-y-3">
          {[0, 1, 2].map((index) => (
            <Skeleton key={index} className="h-28 w-full" />
          ))}
        </div>
      ) : schemes.isError ? (
        <ErrorState
          title="Could not load schemes"
          detail={(schemes.error as Error).message}
          action={
            <Button variant="secondary" onClick={() => schemes.refetch()}>
              Try again
            </Button>
          }
        />
      ) : schemes.data!.schemes.length === 0 ? (
        <EmptyState
          icon={Sprout}
          title="No matching scheme"
          description="Try a different word, or clear the search to see everything available."
        />
      ) : (
        <>
          <div className="space-y-3">
            {schemes.data!.schemes.map((scheme) => (
              <Card key={`${scheme.scope}-${scheme.name}`} className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="type-heading text-content">{scheme.name}</h2>
                  <span className="shrink-0 rounded-full bg-accent-soft px-2.5 py-1 type-caption font-medium text-accent">
                    {scheme.scope}
                  </span>
                </div>
                <p className="type-callout text-content-secondary">{scheme.description}</p>
                {scheme.benefit ? (
                  <p className="type-callout font-medium text-content">
                    Benefit: {scheme.benefit}
                  </p>
                ) : null}
                {scheme.link ? (
                  <a
                    href={scheme.link}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex min-h-tap items-center gap-1.5 type-callout font-medium text-accent"
                  >
                    Official page
                    <ExternalLink aria-hidden className="size-4" />
                  </a>
                ) : null}
              </Card>
            ))}
          </div>
          <p className="type-caption text-content-tertiary">{schemes.data!.disclaimer}</p>
        </>
      )}
    </div>
  );
}
