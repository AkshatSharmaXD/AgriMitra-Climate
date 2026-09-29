"use client";

import { useQuery } from "@tanstack/react-query";
import * as React from "react";
import { IndianRupee, TrendingUp } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { ProvenanceBadge } from "@/components/ui/provenance-badge";
import { ErrorState, Skeleton } from "@/components/ui/states";
import { api } from "@/lib/api";
import { useActiveFarmId } from "@/lib/active-farm";

const COMMODITIES = [
  "Wheat", "Mustard", "Gram", "Barley", "Bajra",
  "Maize", "Paddy", "Cotton", "Groundnut", "Jowar",
] as const;

export default function MarketPage() {
  const { farmId } = useActiveFarmId();

  const farm = useQuery({
    queryKey: ["farm", farmId],
    queryFn: () => api.getFarm(farmId!),
    enabled: Boolean(farmId),
  });

  const [commodity, setCommodity] = React.useState<string>("Wheat");
  const state = farm.data?.state ?? "Rajasthan";

  // Default to whatever the farmer actually grows, once their farm loads.
  React.useEffect(() => {
    if (farm.data?.crop) setCommodity(farm.data.crop);
  }, [farm.data?.crop]);

  const prices = useQuery({
    queryKey: ["market", state, commodity],
    queryFn: () => api.getMarketPrices(state, commodity),
    retry: false,
    staleTime: 30 * 60_000,
  });

  return (
    <div className="space-y-4">
      <PageHeader
        title="Mandi prices"
        description={`Reported rates for ${state}.`}
        provenance={
          prices.data ? <ProvenanceBadge provenance="live" label="Agmarknet" /> : undefined
        }
      />

      <div role="radiogroup" aria-label="Commodity" className="flex flex-wrap gap-2">
        {Array.from(new Set([commodity, ...COMMODITIES])).map((name) => (
          <Button
            key={name}
            role="radio"
            aria-checked={commodity === name}
            variant={commodity === name ? "primary" : "secondary"}
            onClick={() => setCommodity(name)}
          >
            {name}
          </Button>
        ))}
      </div>

      {prices.isPending ? (
        <div className="space-y-3">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : prices.isError ? (
        // No key, or no recent data. Never an estimated price (audit A7).
        <ErrorState
          title={`No ${commodity} prices for ${state}`}
          detail={(prices.error as Error).message}
          action={
            <Button variant="secondary" onClick={() => prices.refetch()}>
              Try again
            </Button>
          }
        />
      ) : (
        <>
          <Card className="border-accent/25 bg-accent-soft">
            <CardHeader
              title="Best reported rate"
              description={`${prices.data!.best.market}, ${prices.data!.best.district}`}
            />
            <p className="flex items-baseline gap-1 type-display type-numeric text-accent">
              <IndianRupee aria-hidden className="size-7" strokeWidth={2.5} />
              {prices.data!.best.modal_price_per_quintal.toLocaleString("en-IN")}
            </p>
            <p className="type-caption mt-1 text-content-secondary">
              per quintal
              {prices.data!.best.arrival_date
                ? ` · reported ${prices.data!.best.arrival_date}`
                : null}
            </p>
          </Card>

          <Card>
            <CardHeader
              title="All reported markets"
              action={
                <span className="flex items-center gap-1 type-caption text-content-tertiary">
                  <TrendingUp aria-hidden className="size-4" />
                  {prices.data!.prices.length}
                </span>
              }
            />
            <ul className="divide-y divide-hairline">
              {prices.data!.prices.map((row, index) => (
                <li
                  key={`${row.market}-${row.district}-${index}`}
                  className="flex items-center gap-3 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="type-callout font-medium text-content">{row.market}</p>
                    <p className="type-caption text-content-tertiary">{row.district}</p>
                  </div>
                  <span className="type-callout type-numeric font-semibold text-content">
                    ₹{row.modal_price_per_quintal.toLocaleString("en-IN")}
                  </span>
                </li>
              ))}
            </ul>
          </Card>

          <p className="type-caption text-content-tertiary">{prices.data!.disclaimer}</p>
        </>
      )}
    </div>
  );
}
