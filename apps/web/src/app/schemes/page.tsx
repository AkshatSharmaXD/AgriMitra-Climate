"use client";

import { SchemesSlideshow } from "@/components/schemes-slideshow";
import { BookOpen } from "lucide-react";

export default function SchemesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 flex flex-col items-center">
      <div className="text-center mb-10 text-white">
        <div className="inline-flex items-center justify-center size-16 rounded-full bg-white/20 mb-4">
          <BookOpen className="size-8" />
        </div>
        <h1 className="text-4xl font-black mb-2">Government Schemes Directory</h1>
        <p className="text-white/80 max-w-2xl mx-auto">Explore exclusive partner programs, subsidies, and insurance options tailored for your agricultural needs.</p>
      </div>

      <div className="w-full max-w-2xl bg-white/10 p-6 rounded-2xl backdrop-blur-sm border border-white/20">
        <SchemesSlideshow />
      </div>
    </div>
  );
}
