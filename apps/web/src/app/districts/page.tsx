"use client";

import * as React from "react";
import { Search, MapPin, TrendingUp, TrendingDown, IndianRupee } from "lucide-react";
import { cn } from "@/lib/utils";

const STATES = ["Andhra Pradesh", "Gujarat", "Karnataka", "Maharashtra", "Punjab", "Rajasthan", "Uttar Pradesh", "West Bengal"];
const DISTRICTS: Record<string, string[]> = {
  "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Bikaner"],
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar"],
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Agra", "Varanasi", "Meerut"],
};

const MANDI_PRICES = [
  { crop: "Wheat", price: "₹2,275", trend: "+2.4%", up: true, arrival: "120 Tons" },
  { crop: "Rice (Paddy)", price: "₹2,183", trend: "-1.2%", up: false, arrival: "85 Tons" },
  { crop: "Mustard", price: "₹5,450", trend: "+0.8%", up: true, arrival: "45 Tons" },
  { crop: "Maize", price: "₹2,090", trend: "+5.1%", up: true, arrival: "210 Tons" },
  { crop: "Soybean", price: "₹4,600", trend: "-0.5%", up: false, arrival: "30 Tons" },
  { crop: "Cotton", price: "₹7,020", trend: "+1.2%", up: true, arrival: "15 Tons" },
];

export default function DistrictsPage() {
  const [selectedState, setSelectedState] = React.useState("Rajasthan");
  const [selectedDistrict, setSelectedDistrict] = React.useState("Jaipur");
  const [loadingPrices, setLoadingPrices] = React.useState(false);

  const districts = DISTRICTS[selectedState] || ["Any District"];

  // Simulate fetching from data.gov.in API
  React.useEffect(() => {
    setLoadingPrices(true);
    // Simulating API call to: 
    // https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=YOUR_API_KEY&format=json&filters[state]=${selectedState}&filters[district]=${selectedDistrict}
    const timer = setTimeout(() => {
      setLoadingPrices(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [selectedState, selectedDistrict]);

  return (
    <div className="font-sans min-h-[calc(100vh-140px)] bg-[#f5f5f5] flex flex-col md:flex-row">
      
      {/* LEFT: Map Area */}
      <div className="w-full md:w-1/2 lg:w-[45%] bg-[#e3f2fd] border-r border-gray-200 relative min-h-[400px] flex flex-col items-center justify-center p-8">
        <div className="absolute top-6 left-6 right-6">
          <div className="bg-white rounded-lg shadow-sm p-4 border border-blue-100 flex items-center justify-between">
            <div>
              <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">Live Region</p>
              <h2 className="text-xl font-black text-gray-900">{selectedDistrict}, {selectedState}</h2>
            </div>
            <MapPin className="size-8 text-[#023e8a]" />
          </div>
        </div>
        
        {/* Abstract Map Representation */}
        <div className="relative w-full max-w-sm aspect-[4/5] bg-blue-100/50 rounded-3xl border-2 border-blue-200 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/India_location_map.svg/500px-India_location_map.svg.png')] bg-no-repeat bg-center bg-contain opacity-50 mix-blend-multiply pointer-events-none" />
          
          {/* Animated markers */}
          <div className="absolute top-[40%] left-[30%] size-3 bg-[#e63946] rounded-full animate-ping" />
          <div className="absolute top-[40%] left-[30%] size-3 bg-[#e63946] rounded-full border-2 border-white shadow-lg" />
          
          <div className="absolute bottom-[30%] right-[30%] size-2.5 bg-[#2e7d32] rounded-full" />
          <div className="absolute top-[20%] left-[45%] size-2 bg-[#f4a261] rounded-full" />
          
          <div className="z-10 bg-white/90 backdrop-blur px-4 py-2 rounded-lg shadow border border-gray-100 text-center mt-[120px]">
            <p className="text-xs text-gray-500 font-medium">Interactive Map Data</p>
            <p className="font-bold text-[#023e8a]">{selectedState} Coverage</p>
          </div>
        </div>
      </div>

      {/* RIGHT: Data & Mandi Prices */}
      <div className="w-full md:w-1/2 lg:w-[55%] bg-white p-4 md:p-8 overflow-y-auto">
        <div className="max-w-2xl mx-auto">
          
          <div className="flex items-center gap-3 mb-8">
            <div className="size-10 bg-[#f4a261]/20 text-[#f4a261] rounded-lg flex items-center justify-center">
              <IndianRupee className="size-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 leading-tight">Mandi Prices & Intelligence</h1>
              <p className="text-sm text-gray-500">State-wise real-time agricultural commodity prices</p>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Select State</label>
              <select 
                value={selectedState} 
                onChange={(e) => {
                  setSelectedState(e.target.value);
                  setSelectedDistrict(DISTRICTS[e.target.value]?.[0] || "Any District");
                }}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2e7d32]/50"
              >
                {STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Select District</label>
              <select 
                value={selectedDistrict} 
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2e7d32]/50"
              >
                {districts.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          {/* Mandi Table */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="bg-[#1b3a1b] px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white flex items-center gap-2">
                  <TrendingUp className="size-5 text-yellow-400" />
                  Live Mandi Prices
                </h3>
                <p className="text-[10px] text-green-200 mt-0.5">Source: data.gov.in (AGMARKNET)</p>
              </div>
              <span className="text-xs text-white/70 bg-white/10 px-2 py-1 rounded">Updated Today</span>
            </div>
            
            <div className="divide-y divide-gray-100 min-h-[300px]">
              {loadingPrices ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="size-10 border-4 border-[#2e7d32] border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="text-sm font-bold text-gray-500">Fetching live data from data.gov.in...</p>
                </div>
              ) : (
                MANDI_PRICES.map((item, i) => (
                  <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                    <div className="flex items-center gap-4">
                      <div className={cn("size-10 rounded-full flex items-center justify-center", item.up ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
                        {item.up ? <TrendingUp className="size-5" /> : <TrendingDown className="size-5" />}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{item.crop}</p>
                        <p className="text-xs text-gray-500">Arrival: {item.arrival}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-lg text-gray-900">{item.price}</p>
                      <p className={cn("text-xs font-bold", item.up ? "text-green-600" : "text-red-600")}>
                        {item.up ? "▲" : "▼"} {item.trend}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          
          <div className="mt-6 bg-[#fff3e0] border border-[#ffe0b2] rounded-lg p-4 text-sm text-[#e65100]">
            <p className="font-bold mb-1">Disclaimer</p>
            <p className="opacity-90">Prices shown are aggregated modal prices from major mandis in the selected district. Actual local prices may vary based on quality and moisture content.</p>
          </div>

        </div>
      </div>

    </div>
  );
}
