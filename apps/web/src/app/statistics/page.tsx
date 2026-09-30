"use client";

import * as React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Mock Data for Charts
const CHART_DATA = [
  { year: "2016", applications: 586, area: 568, sum: 203814, premium: 21854, claims: 16871 },
  { year: "2017", applications: 538, area: 510, sum: 203914, premium: 24626, claims: 22231 },
  { year: "2018", applications: 582, area: 608, sum: 234987, premium: 29672, claims: 29355 },
  { year: "2019", applications: 620, area: 581, sum: 221400, premium: 32280, claims: 28038 },
  { year: "2020", applications: 625, area: 510, sum: 199507, premium: 30325, claims: 20594 },
  { year: "2021", applications: 830, area: 466, sum: 180328, premium: 27290, claims: 20572 },
  { year: "2022", applications: 1120, area: 500, sum: 213576, premium: 28723, claims: 19903 },
  { year: "2023", applications: 1435, area: 608, sum: 274705, premium: 24823, claims: 21894 },
  { year: "2024", applications: 1523, area: 623, sum: 281364, premium: 23266, claims: 16037 },
  { year: "2025", applications: 1393, area: 558, sum: 232011, premium: 15945, claims: 10613 },
  { year: "2026", applications: 886, area: 278, sum: 172220, premium: 11929, claims: 0 },
];

export default function StatisticsPage() {
  const [tab, setTab] = React.useState<"admin" | "graphical">("graphical");

  return (
    <div className="font-sans min-h-screen bg-[#f1fcf1]">
      <div className="bg-[#1b3a1b] py-6 px-4 md:px-8 border-b-4 border-yellow-400">
        <div className="mx-auto max-w-[1400px]">
          <h1 className="text-2xl md:text-3xl font-black text-white">Pradhan Mantri Fasal Bima Yojana</h1>
          <p className="text-white/80 mt-1 text-sm">MINISTRY OF AGRICULTURE & FARMERS WELFARE</p>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-4 md:px-8 py-8">
        
        {/* Sub-Header with Tabs */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 bg-white p-4 rounded-xl shadow border border-green-200">
          <h2 className="text-xl font-bold text-gray-800">
            {tab === "admin" ? "Administrative Dashboard" : "Graphical Dashboard"}
          </h2>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <button 
              className={`px-4 py-2 text-sm font-bold rounded-lg border ${tab === "admin" ? "bg-green-800 text-white border-green-800" : "bg-white text-gray-700 hover:bg-green-50"}`}
              onClick={() => setTab("admin")}
            >
              Administrative Report
            </button>
            <button 
              className={`px-4 py-2 text-sm font-bold rounded-lg border ${tab === "graphical" ? "bg-green-800 text-white border-green-800" : "bg-white text-gray-700 hover:bg-green-50"}`}
              onClick={() => setTab("graphical")}
            >
              Graphical Analysis
            </button>
          </div>
        </div>

        {tab === "graphical" ? <GraphicalDashboard /> : <AdminDashboard />}

      </div>
    </div>
  );
}

function GraphicalDashboard() {
  return (
    <div className="space-y-6">
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { v: "10,135", l: "Applications (In Lakh)" },
          { v: "5,811", l: "Area Insured (In Lakh Ha)" },
          { v: "2,417,828", l: "Sum Insured (In Crore)" },
          { v: "42,781", l: "Farmers Premium (In Crore)" },
        ].map((s, i) => (
          <div key={i} className="bg-white border-t-4 border-blue-400 p-4 rounded shadow-sm text-center">
            <p className="text-3xl font-black text-gray-800">{s.v}</p>
            <p className="text-sm font-bold text-gray-600 mt-2">{s.l}</p>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Farmer Applications Enrolled" subtitle="Farmer Applications by Year (In Lakh)" dataKey="applications" />
        <ChartCard title="Area Insured" subtitle="Area Insured by Year (In Lakh Ha)" dataKey="area" />
        <ChartCard title="Sum Insured" subtitle="Sum Insured by Year (In Crore)" dataKey="sum" />
        <ChartCard title="Gross Premium" subtitle="Net Gross Premium by Year (In Crore)" dataKey="premium" />
      </div>
    </div>
  );
}

function ChartCard({ title, subtitle, dataKey }: { title: string, subtitle: string, dataKey: string }) {
  return (
    <div className="bg-green-50 border border-green-600 rounded-lg overflow-hidden flex flex-col">
      <div className="bg-white px-4 py-2 border-b border-green-600 flex justify-between items-end">
        <h3 className="font-bold text-gray-900">{title}</h3>
        <p className="text-xs font-bold text-green-700 italic">{subtitle}</p>
      </div>
      <div className="p-4 h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={CHART_DATA} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ccc" />
            <XAxis dataKey="year" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#1b3a1b", fontWeight: "bold" }} />
            <Tooltip cursor={{ fill: "rgba(0,0,0,0.05)" }} contentStyle={{ borderRadius: "8px", fontWeight: "bold" }} />
            <Bar dataKey={dataKey} fill="#388e3c" radius={[2, 2, 0, 0]} barSize={35} label={{ position: "insideBottom", angle: -90, fill: "white", fontSize: 12, offset: 15, fontWeight: "bold" }} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function AdminDashboard() {
  const KHARIF = [
    { label: "States/UTs", v22: "21", v23: "21", v24: "23", v25: "24", v26: "25" },
    { label: "Districts", v22: "471", v23: "496", v24: "536", v25: "548", v26: "547" },
    { label: "Insurance Units", v22: "1,40,681", v23: "1,41,307", v24: "1,49,226", v25: "1,46,925", v26: "1,55,777" },
    { label: "Farmers", v22: "2,00,58,814", v23: "2,52,68,201", v24: "2,96,29,227", v25: "2,29,76,591", v26: "2,73,17,897" },
  ];
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Kharif Table */}
      <div className="bg-white border-2 border-green-800 rounded-lg overflow-hidden">
        <div className="bg-green-800 text-white p-3 flex justify-between items-center">
          <span className="font-bold text-yellow-300">Season: Kharif</span>
        </div>
        <table className="w-full text-sm text-right">
          <thead>
            <tr className="bg-green-700 text-white">
              <th className="p-2 text-left bg-green-800 w-1/3">Notification</th>
              <th className="p-2">2022</th>
              <th className="p-2">2023</th>
              <th className="p-2">2024</th>
              <th className="p-2">2025</th>
              <th className="p-2">2026</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {KHARIF.map((r, i) => (
              <tr key={i} className="hover:bg-green-50">
                <td className="p-3 text-left font-bold text-gray-800">{r.label}</td>
                <td className="p-3">{r.v22}</td>
                <td className="p-3">{r.v23}</td>
                <td className="p-3">{r.v24}</td>
                <td className="p-3">{r.v25}</td>
                <td className="p-3">{r.v26}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Rabi Table (Mocked same data for demo) */}
      <div className="bg-white border-2 border-green-800 rounded-lg overflow-hidden">
        <div className="bg-green-800 text-white p-3 flex justify-between items-center">
          <span className="font-bold text-yellow-300">Season: Rabi</span>
        </div>
        <table className="w-full text-sm text-right">
          <thead>
            <tr className="bg-green-700 text-white">
              <th className="p-2 text-left bg-green-800 w-1/3">Notification</th>
              <th className="p-2">2022</th>
              <th className="p-2">2023</th>
              <th className="p-2">2024</th>
              <th className="p-2">2025</th>
              <th className="p-2">2026</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {KHARIF.map((r, i) => (
              <tr key={i} className="hover:bg-green-50">
                <td className="p-3 text-left font-bold text-gray-800">{r.label}</td>
                <td className="p-3">{r.v22}</td>
                <td className="p-3">{r.v23}</td>
                <td className="p-3">{r.v24}</td>
                <td className="p-3">{r.v25}</td>
                <td className="p-3">{r.v26}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
