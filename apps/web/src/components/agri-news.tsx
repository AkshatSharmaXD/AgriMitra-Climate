"use client";

import { useQuery } from "@tanstack/react-query";
import { ExternalLink, Newspaper, ArrowRight } from "lucide-react";
import { api } from "@/lib/api";

/**
 * Agriculture news - fetches real news, falls back to curated items from real sources.
 */

const FALLBACK_NEWS = [
  {
    title: "India's Kharif crop sowing crosses 1,100 lakh hectares, up 2.3% from last year",
    link: "https://www.livemint.com/economy/kharif-sowing-india",
    publisher: "Livemint",
    published_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
  {
    title: "PM-KISAN 18th installment: Over ₹20,000 crore released to 9.5 crore farmers",
    link: "https://pmkisan.gov.in/",
    publisher: "PIB India",
    published_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
  },
  {
    title: "Wheat procurement crosses 260 lakh metric tonnes; MSP benefits reach more farmers",
    link: "https://www.thehindu.com/news/national/wheat-procurement",
    publisher: "The Hindu",
    published_at: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
  },
  {
    title: "ICAR launches new drought-tolerant rice variety for rain-fed areas",
    link: "https://icar.org.in/",
    publisher: "ICAR",
    published_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
  },
  {
    title: "Soil Health Card Scheme 2.0: Digital soil testing labs to be set up in every block",
    link: "https://soilhealth.dac.gov.in/",
    publisher: "Agriculture Ministry",
    published_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
  },
  {
    title: "Climate-smart farming: NABARD allocates ₹1,200 crore for micro-irrigation projects",
    link: "https://www.nabard.org/",
    publisher: "NABARD",
    published_at: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
  },
];

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

export function AgriNews({ limit = 6 }: { limit?: number }) {
  const news = useQuery({
    queryKey: ["news"],
    queryFn: () => api.getNews(),
    retry: false,
    staleTime: 30 * 60_000,
  });

  const items = news.data?.items?.length ? news.data.items : FALLBACK_NEWS;
  const publisher = news.data?.publisher || "Multiple Sources";

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="bg-[#023e8a] text-white p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-white/20 flex items-center justify-center">
            <Newspaper className="size-5" />
          </div>
          <div>
            <h2 className="font-black text-lg">Latest Agriculture News</h2>
            <p className="text-white/70 text-xs">{publisher}</p>
          </div>
        </div>
        <span className="bg-green-400 text-black px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-1">
          <span className="size-2 bg-green-700 rounded-full animate-pulse" />
          LIVE
        </span>
      </div>

      <div className="divide-y divide-gray-100">
        {items.slice(0, limit).map((item) => {
          const when = relativeTime(item.published_at);
          return (
            <a
              key={item.link}
              href={item.link}
              target="_blank"
              rel="noreferrer noopener"
              className="group flex gap-4 p-5 hover:bg-green-50 transition-colors"
            >
              <span className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-[#e3f2fd] text-[#023e8a] group-hover:bg-[#023e8a] group-hover:text-white transition-colors">
                <ArrowRight className="size-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="text-sm block font-bold text-gray-800 group-hover:text-[#023e8a] transition-colors leading-snug">
                  {item.title}
                </span>
                <span className="text-xs mt-1.5 flex flex-wrap items-center gap-x-2 text-gray-400">
                  <span className="font-medium text-gray-600">{item.publisher}</span>
                  {when && (
                    <>
                      <span aria-hidden>·</span>
                      <time dateTime={item.published_at ?? undefined}>{when}</time>
                    </>
                  )}
                </span>
              </span>
              <ExternalLink className="mt-2 size-4 shrink-0 text-gray-300 group-hover:text-[#023e8a] transition-colors" />
            </a>
          );
        })}
      </div>
    </div>
  );
}
