"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import * as React from "react";
import { Loader2, MapPin, Droplets, Wheat, BarChart3, AlertTriangle } from "lucide-react";
import { DistrictMap } from "@/components/charts/district-map";
import { api, type RiskLevel } from "@/lib/api";
import { RISK_LABEL, RISK_TEXT } from "@/lib/format";
import { cn } from "@/lib/utils";

const BANDS: RiskLevel[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

const BAND_COLORS: Record<string, string> = {
  LOW: "bg-green-500",
  MEDIUM: "bg-yellow-500",
  HIGH: "bg-orange-500",
  CRITICAL: "bg-red-500",
};

export default function DistrictsPage() {
  const [selected, setSelected] = React.useState<string | null>(null);

  const overview = useQuery({
    queryKey: ["districts"],
    queryFn: () => api.getDistrictOverview(),
  });

  React.useEffect(() => {
    if (!selected && overview.data?.districts.length) {
      setSelected(overview.data.districts[0]!.district);
    }
  }, [overview.data, selected]);

  const district = overview.data?.districts.find((d) => d.district === selected) ?? null;

  const interventions = useMutation({
    mutationFn: (name: string) => api.getInterventions(name),
  });

  const onSelect = React.useCallback((name: string) => {
    setSelected(name);
    interventions.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (overview.isPending) {
    return (
      <div className="mx-auto max-w-[1400px] w-full pt-12 pb-12 px-4 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-white">
          <Loader2 className="size-12 animate-spin" />
          <p className="font-bold text-lg">Loading district data...</p>
        </div>
      </div>
    );
  }

  if (overview.isError) {
    return (
      <div className="mx-auto max-w-[1400px] w-full pt-12 pb-12 px-4">
        <div className="bg-red-100 border-2 border-red-400 rounded-2xl p-8 text-center">
          <AlertTriangle className="size-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-black text-red-800 mb-2">District data unavailable</h2>
          <p className="text-red-700 text-sm mb-4">{(overview.error as Error).message}</p>
          <button onClick={() => overview.refetch()} className="bg-red-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-red-700">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const data = overview.data!;

  if (data.districts_analyzed === 0) {
    return (
      <div className="mx-auto max-w-[1400px] w-full pt-12 pb-12 px-4">
        <h1 className="text-3xl font-black text-white mb-6">📊 District Intelligence</h1>
        <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
          <MapPin className="size-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-gray-800 mb-2">No farms recorded yet</h2>
          <p className="text-gray-500">District statistics appear once farms are registered.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] w-full pt-8 pb-12 px-4 font-sans">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white mb-2">📊 District Intelligence</h1>
          <p className="text-white/80 text-sm">Aggregated risk analysis across all registered farms</p>
        </div>
        {data.is_demo && (
          <span className="bg-yellow-400 text-black px-4 py-1.5 rounded-full text-xs font-black">DEMO DATA</span>
        )}
      </div>

      {/* State Roll-up Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {BANDS.map((band) => (
          <div key={band} className="bg-white rounded-2xl shadow-lg p-5 text-center hover:-translate-y-1 transition-transform">
            <div className={cn("mx-auto size-4 rounded-full mb-3", BAND_COLORS[band])} />
            <p className={cn("text-xs font-bold uppercase tracking-wider mb-1", RISK_TEXT[band])}>{RISK_LABEL[band]}</p>
            <p className="text-3xl font-black text-gray-800">{data.risk_bands[band] ?? 0}</p>
            <p className="text-xs text-gray-500 mt-1">districts</p>
          </div>
        ))}
      </div>

      {/* Summary Bar */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 mb-8 text-white flex flex-wrap gap-6 items-center">
        <div className="flex items-center gap-2">
          <MapPin className="size-4 text-yellow-300" />
          <span className="font-bold">{data.districts_analyzed}</span>
          <span className="text-white/70 text-sm">Districts Analysed</span>
        </div>
        <div className="flex items-center gap-2">
          <BarChart3 className="size-4 text-yellow-300" />
          <span className="font-bold">{data.farms_analyzed}</span>
          <span className="text-white/70 text-sm">Farms Covered</span>
        </div>
        <div className="flex items-center gap-2 text-white/60 text-sm ml-auto">
          State: <span className="font-bold text-white">Rajasthan</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Map + District Selector */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="font-black text-gray-800 text-lg mb-4">District Risk Map</h2>
            <DistrictMap
              districts={data.districts}
              onSelect={onSelect}
              selected={selected ?? undefined}
            />
          </div>

          {/* District pills */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {data.districts.map((item) => (
              <button
                key={item.district}
                onClick={() => onSelect(item.district)}
                className={cn(
                  "shrink-0 px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-sm",
                  item.district === selected
                    ? "bg-[#fbc02d] text-black shadow-md"
                    : "bg-white text-gray-700 hover:bg-gray-100 hover:shadow-md"
                )}
              >
                {item.district}
              </button>
            ))}
          </div>
        </div>

        {/* Right: District Detail Card */}
        <div className="space-y-6">
          {district && (
            <>
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-[#2e7d32] text-white p-5">
                  <h2 className="text-xl font-black">{district.district}</h2>
                  <p className="text-white/80 text-xs mt-1">{district.farm_count} farms · {district.farms_with_risk} with computed risk</p>
                </div>
                <div className="p-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-green-100 flex items-center justify-center">
                      <Wheat className="size-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Dominant Crop</p>
                      <p className="font-bold text-gray-800">{district.dominant_crop ?? "Not recorded"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Droplets className="size-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Water Stress</p>
                      <p className={cn("font-bold", district.water_stress_level ? RISK_TEXT[district.water_stress_level] : "text-gray-400")}>
                        {district.water_stress_level
                          ? `${RISK_LABEL[district.water_stress_level]} (${district.water_stress_score}/100)`
                          : "Not assessed"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium mb-2">Top Crops</p>
                    <div className="flex flex-wrap gap-2">
                      {district.top_crops.length > 0 ? district.top_crops.map((crop) => (
                        <span key={crop} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold">{crop}</span>
                      )) : <span className="text-gray-400 text-sm">Not recorded</span>}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 border-t border-gray-200 pt-4">
                    {BANDS.map((band) => (
                      <div key={band} className="text-center">
                        <p className={cn("text-[10px] font-bold uppercase", RISK_TEXT[band])}>{RISK_LABEL[band]}</p>
                        <p className="text-xl font-black text-gray-800">{district.risk_bands[band] ?? 0}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Interventions */}
              <div className="bg-white rounded-2xl shadow-lg p-5">
                <h3 className="font-black text-gray-800 mb-3">Intervention Priorities</h3>
                <p className="text-xs text-gray-500 mb-4">Generated by Gemini from the computed statistics above.</p>
                {interventions.data ? (
                  <div className="space-y-4">
                    {interventions.data.interventions.map((item) => (
                      <div key={item.action} className="border-l-4 border-[#2e7d32] pl-4 py-1">
                        <p className="font-bold text-gray-800 text-sm">{item.action}</p>
                        <p className="text-xs text-green-700 font-medium mt-0.5">Priority: {item.priority}</p>
                        <p className="text-xs text-gray-600 mt-1">{item.reasoning}</p>
                      </div>
                    ))}
                    <p className="border-t border-gray-200 pt-3 text-[10px] text-gray-400">{interventions.data.disclaimer}</p>
                  </div>
                ) : interventions.isError ? (
                  <div className="bg-red-50 rounded-xl p-4 text-sm text-red-700">
                    Interventions unavailable: {(interventions.error as Error).message}
                  </div>
                ) : (
                  <button
                    disabled={interventions.isPending}
                    onClick={() => interventions.mutate(district.district)}
                    className="w-full bg-[#2e7d32] text-white py-3 rounded-xl font-bold hover:bg-[#1b5e20] transition-colors flex items-center justify-center gap-2"
                  >
                    {interventions.isPending && <Loader2 className="size-5 animate-spin" />}
                    Generate intervention priorities
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
