"use client";

import * as React from "react";
import { Play } from "lucide-react";

const EXPERT_PODCASTS = [
  {
    title: "फसल बीमा में प्रौद्योगिकी की भूमिका | #ExpertSays",
    topic: "फसल बीमा में प्रौद्योगिकी",
    desc: "#ExpertSays पॉडकास्ट में हमारे साथ हैं श्री गजेन्द्र सिंह, पूर्व निदेशक, फसल बीमा, भारत सरकार। उन्होंने...",
    img: "https://pmfby.gov.in/images/gallery/expert-says-thumb-1.jpg", 
    color: "bg-green-700"
  },
  {
    title: "IC Experience and Strengthening PMFBY Implementation",
    topic: "IC Experience and Strengthening PMFBY Implementation",
    desc: "How do you insure a nation as vast and diverse as India? Dr. Lavanya R Mundayur, CMD of Agriculture...",
    img: "https://pmfby.gov.in/images/gallery/expert-says-thumb-2.jpg",
    color: "bg-green-700"
  },
  {
    title: "Anuj Tyagi on Insurance Transformation | #ExpertSays",
    topic: "Technology, Trust, and Farmers: Anuj Tyagi on Insurance Transformation",
    desc: "In this episode of Expert Says, we sit down with Mr. Anuj Tyagi, MD & CEO of HDFC ERGO General Insur...",
    img: "https://pmfby.gov.in/images/gallery/expert-says-thumb-3.jpg",
    color: "bg-green-700"
  },
  {
    title: "Innovation and Inclusion in Rural Insurance with Tata AIG",
    topic: "Innovation and Inclusion in Rural Insurance with Tata AIG",
    desc: "In this power-packed episode of the #ExpertSays Podcast, we sit down with one of the foremost voices...",
    img: "https://pmfby.gov.in/images/gallery/expert-says-thumb-4.jpg",
    color: "bg-green-700"
  }
];

export default function GalleryPage() {
  return (
    <div className="font-sans min-h-screen bg-[#f1fcf1]">
      <div className="bg-[#1b3a1b] py-6 px-4 md:px-8 border-b-4 border-yellow-400">
        <div className="mx-auto max-w-[1400px]">
          <h1 className="text-2xl md:text-3xl font-black text-white">Video Gallery & Podcasts</h1>
          <p className="text-white/80 mt-1 text-sm">#ExpertSays - Hear from the industry experts</p>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-4 md:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {EXPERT_PODCASTS.map((item, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden group flex flex-col h-full">
              
              {/* Video Thumbnail Area */}
              <div className="relative aspect-video bg-gray-200 overflow-hidden flex items-center justify-center">
                {/* Fallback pattern if images are broken */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-green-100" />
                
                {/* Simulated Thumbnail - Note: In a real app we would use actual images */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                  <div className="bg-white rounded-full p-1 border-2 border-orange-500">
                    <img src="https://pmfby.gov.in/images/logo.png" className="h-6 w-6 object-contain" alt="PMFBY" />
                  </div>
                  <div className="text-white">
                    <p className="text-sm font-bold leading-tight">{item.title}</p>
                    <p className="text-[10px]">PMFBY</p>
                  </div>
                </div>

                <button className="z-20 bg-red-600 text-white rounded-xl py-3 px-6 shadow-lg transform group-hover:scale-110 transition-transform flex items-center gap-2">
                  <Play className="fill-current size-5" />
                </button>

                <div className="absolute bottom-4 z-20 text-white/90 text-sm font-bold w-full text-center tracking-widest bg-black/40 py-1">
                  Watch on <span className="text-white">YouTube</span>
                </div>
              </div>

              {/* Text Content */}
              <div className="p-5 flex flex-col flex-1">
                <h3 className="font-bold text-gray-900 leading-snug mb-2">{item.title}</h3>
                <p className="text-xs text-gray-600 line-clamp-2 mb-2 flex-1">{item.desc}</p>
                <button className="text-blue-600 text-xs font-bold self-start hover:underline">Read more</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
