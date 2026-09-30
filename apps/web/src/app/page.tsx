"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { Droplets, IndianRupee, Leaf, MapPin, ScrollText, Sprout, CloudSun, Bug, BarChart3, Bot } from "lucide-react";

import { AgriNews } from "@/components/agri-news";
import { RiskStratum } from "@/components/charts/risk-stratum";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useActiveFarmId } from "@/lib/active-farm";
import { RISK_LABEL, RISK_TEXT, formatDay, ndviColor, weatherLabel } from "@/lib/format";
import { cn } from "@/lib/utils";

const COMPONENT_LABELS: Record<string, string> = {
  water_stress: "Water",
  heat_stress: "Heat",
  disease_risk: "Disease",
  rainfall_risk: "Rainfall",
  vegetation_risk: "Vegetation",
};

// Animation variants removed for stability

export default function FarmDashboardPage() {
  const router = useRouter();
  const { farmId, ready } = useActiveFarmId();

  React.useEffect(() => {
    if (ready && !farmId) router.replace("/onboarding");
  }, [ready, farmId, router]);

  const farm = useQuery({
    queryKey: ["farm", farmId],
    queryFn: () => api.getFarm(farmId!),
    enabled: Boolean(farmId),
  });

  const risk = useQuery({
    queryKey: ["risk", farmId],
    queryFn: () => api.getFarmRisk(farmId!),
    enabled: Boolean(farmId),
  });

  const weather = useQuery({
    queryKey: ["weather", farm.data?.location],
    queryFn: () => api.getWeather(farm.data!.location.lat, farm.data!.location.lng),
    enabled: Boolean(farm.data),
  });

  const satellite = useQuery({
    queryKey: ["satellite", farm.data?.location],
    queryFn: () =>
      api.getSatellite(farm.data!.location.lat, farm.data!.location.lng, farm.data!.district),
    enabled: Boolean(farm.data),
    staleTime: 60 * 60_000,
  });

  if (!ready || (farmId && farm.isPending)) {
    return (
      <div className="mx-auto max-w-[1400px] w-full pt-12 pb-12 px-4 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-white">
          <Sprout className="size-12 animate-pulse" />
          <p className="font-bold text-lg">Loading your farm...</p>
        </div>
      </div>
    );
  }

  if (!farmId) return null;

  if (farm.isError) {
    return (
      <div className="mx-auto max-w-[1400px] w-full pt-12 pb-12 px-4">
        <div className="bg-red-100 border-2 border-red-400 rounded-2xl p-8 text-center">
          <h2 className="text-xl font-black text-red-800 mb-2">Could not load your farm</h2>
          <p className="text-red-700 text-sm mb-4">{(farm.error as Error).message}</p>
          <button onClick={() => farm.refetch()} className="bg-red-600 text-white px-6 py-2 rounded-xl font-bold">Try again</button>
        </div>
      </div>
    );
  }

  const f = farm.data!;

  return (
    <div className="font-sans min-h-screen bg-[#f5f5f5]">
      {/* PMFBY-style green header for the page */}
      <div className="bg-[#1b3a1b] py-6 px-4 md:px-8 border-b-4 border-yellow-400">
        <div className="mx-auto max-w-[1400px] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl md:text-3xl font-black text-white flex items-center gap-2">
                <Sprout className="size-6 text-yellow-300" />
                {f.crop} · {f.area_acres} acres
              </h1>
              {f.is_demo && <span className="bg-yellow-400 text-black px-3 py-1 rounded-full text-[10px] font-black">DEMO</span>}
            </div>
            <p className="flex items-center gap-2 text-white/80 text-sm font-medium">
              <MapPin className="size-4 text-yellow-300" />
              {f.district}, {f.state} <span className="opacity-50">•</span> {f.soil.type} soil <span className="opacity-50">•</span> {f.irrigation}
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] w-full pt-8 pb-12 px-4 space-y-8">

      {/* Quick Action Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { href: "/scan", label: "AI Crop Scanner", icon: Bug, color: "bg-[#9d4edd]" },
          { href: "/assistant", label: "AI Chatbot", icon: Bot, color: "bg-[#ff4d6d]" },
          { href: "/weather", label: "Live Weather", icon: CloudSun, color: "bg-[#023e8a]" },
          { href: "/districts", label: "District Data", icon: Map, color: "bg-[#f4a261]" },
        ].map((action) => (
          <Link key={action.href} href={action.href} className="bg-white rounded-2xl shadow-lg p-5 flex flex-col items-center text-center hover:-translate-y-1 transition-all group">
            <div className={cn("size-12 rounded-full text-white flex items-center justify-center mb-3 group-hover:scale-110 transition-transform", action.color)}>
              <action.icon className="size-6" />
            </div>
            <span className="font-bold text-gray-800 text-sm">{action.label}</span>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Score Card */}
        <div variants={itemVariants} className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-[#2e7d32] text-white p-5">
              <h2 className="font-black text-lg">Farm Risk Score</h2>
              <p className="text-white/70 text-xs">Computed from your farm record and live signals</p>
            </div>
            <div className="p-6">
              {risk.isPending ? (
                <div className="h-48 bg-gray-100 animate-pulse rounded-xl" />
              ) : risk.isError ? (
                <div className="bg-red-50 rounded-xl p-4">
                  <p className="text-red-800 font-bold">Risk could not be calculated</p>
                  <p className="text-red-600 text-sm mt-1">{(risk.error as Error).message}</p>
                  <button onClick={() => risk.refetch()} className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold">Retry</button>
                </div>
              ) : (
                <>
                  <div className="flex items-baseline gap-4 mb-6">
                    <span className="text-5xl font-black text-gray-800">{risk.data!.overall_score}</span>
                    <span className="text-gray-400 text-lg">/100</span>
                    <span className={cn("ml-auto text-xl font-black px-4 py-1.5 rounded-full", 
                      risk.data!.level === "LOW" && "bg-green-100 text-green-800",
                      risk.data!.level === "MEDIUM" && "bg-yellow-100 text-yellow-800",
                      risk.data!.level === "HIGH" && "bg-orange-100 text-orange-800",
                      risk.data!.level === "CRITICAL" && "bg-red-100 text-red-800"
                    )}>
                      {RISK_LABEL[risk.data!.level]}
                    </span>
                  </div>

                  <RiskStratum
                    components={Object.entries(risk.data!.weights).map(([key, weight]) => ({
                      key,
                      label: COMPONENT_LABELS[key] ?? key,
                      score: (risk.data as unknown as Record<string, number>)[key] ?? 0,
                      weight,
                    }))}
                  />

                  {risk.data!.assumptions.length > 0 && (
                    <div className="mt-5 border-t border-gray-200 pt-4">
                      <h3 className="font-bold text-gray-700 text-sm mb-2">Assumptions</h3>
                      <ul className="space-y-1">
                        {risk.data!.assumptions.map((note) => (
                          <li key={note} className="flex gap-2 text-xs text-gray-500">
                            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-gray-300" />
                            {note}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Weather Card */}
        <div variants={itemVariants}>
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden h-full">
            <div className="bg-[#023e8a] text-white p-5">
              <div className="flex items-center justify-between">
                <h2 className="font-black text-lg flex items-center gap-2">
                  <CloudSun className="size-5" /> Next 7 Days
                </h2>
                {weather.data && !weather.data.degraded && (
                  <span className="bg-green-400 text-black px-2 py-0.5 rounded-full text-[10px] font-black">LIVE</span>
                )}
              </div>
            </div>
            <div className="p-5">
              {weather.isPending ? (
                <div className="h-32 bg-gray-100 animate-pulse rounded-xl" />
              ) : weather.isError || weather.data?.degraded ? (
                <div className="bg-yellow-50 rounded-xl p-4 text-center">
                  <CloudSun className="size-8 text-yellow-400 mx-auto mb-2" />
                  <p className="text-yellow-800 font-bold text-sm">Weather unavailable</p>
                  <button onClick={() => weather.refetch()} className="mt-2 bg-yellow-500 text-black px-4 py-1.5 rounded-lg text-xs font-bold">Retry</button>
                </div>
              ) : (
                <>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {weather.data!.forecast.map((day) => (
                      <div key={day.date} className="min-w-[4rem] shrink-0 rounded-xl border border-gray-200 p-2.5 text-center hover:bg-green-50 transition-colors">
                        <p className="text-[10px] text-gray-500 font-medium">{formatDay(day.date)}</p>
                        <p className="text-sm font-black text-gray-800 mt-1">{Math.round(day.temp_max)}°</p>
                        <p className="text-[10px] text-gray-400">{Math.round(day.temp_min)}°</p>
                        <p className="text-[10px] font-bold text-blue-600 mt-1">{day.precipitation_mm.toFixed(1)}mm</p>
                      </div>
                    ))}
                  </div>
                  {weather.data!.current && (
                    <p className="mt-3 text-xs text-gray-500 bg-gray-50 rounded-lg p-2 text-center">
                      Now <strong>{Math.round(weather.data!.current.temperature_c)}°C</strong> · {weatherLabel(weather.data!.current.weather_code)} · {weather.data!.current.humidity_pct}% humidity
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Vegetation + Quick Links Row */}
      <div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* NDVI Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="font-black text-gray-800 mb-3 flex items-center gap-2">
            <Leaf className="size-5 text-green-600" /> Vegetation Index
          </h3>
          {satellite.isPending ? (
            <div className="h-16 bg-gray-100 animate-pulse rounded-xl" />
          ) : satellite.isError ? (
            <p className="text-gray-400 text-sm">No satellite data available</p>
          ) : (
            <div className="flex items-center gap-4">
              <div className="size-14 shrink-0 rounded-xl shadow-inner" style={{ background: ndviColor(satellite.data!.ndvi) }} />
              <div>
                <p className="text-3xl font-black text-gray-800">{satellite.data!.ndvi.toFixed(2)}</p>
                <p className="text-xs text-gray-500">{satellite.data!.vegetation_status}</p>
                {satellite.data!.is_live && <span className="text-[10px] text-green-600 font-bold">Sentinel-2</span>}
              </div>
            </div>
          )}
        </div>

        {/* Mandi Prices Link */}
        <Link href="/market" className="bg-white rounded-2xl shadow-lg p-6 flex items-center gap-4 hover:-translate-y-1 transition-all group">
          <div className="size-14 rounded-full bg-[#f4a261] text-white flex items-center justify-center group-hover:scale-110 transition-transform">
            <IndianRupee className="size-7" />
          </div>
          <div>
            <p className="font-black text-gray-800 text-lg">Mandi Prices</p>
            <p className="text-xs text-gray-500">Live market rates for crops</p>
          </div>
        </Link>

        {/* Schemes Link */}
        <Link href="/schemes" className="bg-white rounded-2xl shadow-lg p-6 flex items-center gap-4 hover:-translate-y-1 transition-all group">
          <div className="size-14 rounded-full bg-[#9d4edd] text-white flex items-center justify-center group-hover:scale-110 transition-transform">
            <ScrollText className="size-7" />
          </div>
          <div>
            <p className="font-black text-gray-800 text-lg">Govt Schemes</p>
            <p className="text-xs text-gray-500">Subsidies & insurance programs</p>
          </div>
        </Link>
      </div>

      {/* Agriculture News */}
      <div>
        <AgriNews />
      </div>
      </div>
    </div>
  );
}
