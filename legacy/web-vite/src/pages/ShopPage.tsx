
import { Search, ShoppingBag, ChevronRight, Menu, CheckCircle2, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const categories = [
    { name: "Nutrients", icon: "🧪" },
    { name: "Fungicides", icon: "🦠" },
    { name: "Insecticides", icon: "🐛" },
    { name: "Seeds", icon: "🌱" },
    { name: "Weedicides", icon: "🌿" },
    { name: "Tissue Culture", icon: "🧫" },
];

const trendingProducts = [
    { id: 1, name: "Aries Agro Micromix", price: "573.00", oldPrice: "600.00", tag: "Sale", img: "🛍️" },
    { id: 2, name: "Paras Bio Plant Growth Promoter", price: "455.00", oldPrice: "520.00", tag: "Sale", img: "🪴" },
    { id: 3, name: "Sumitomo Taboli Plant Growth Regulator", price: "792.00", oldPrice: "899.00", tag: "Sale", img: "🌾" },
    { id: 4, name: "Ankur Mahavir Micromix", price: "305.00", oldPrice: "349.00", tag: "Sale", img: "🪴" },
];

const brands = ["IFFCO", "CORTEVA", "SWAL", "UPL", "BAYER"];

export default function ShopPage() {
    return (
        <div className="min-h-screen bg-white pb-20">
            {/* Top Navigation Bar */}
            <div className="bg-[#1f2937] text-white p-3 sticky top-0 z-50 flex items-center justify-between gap-4 shadow-md">
                <div className="flex items-center gap-2 flex-shrink-0">
                    <Menu className="w-6 h-6 sm:hidden cursor-pointer" />
                    <h1 className="text-xl font-bold tracking-tight">AgriMitra<span className="text-green-400">Shop</span></h1>
                </div>

                <div className="flex-1 max-w-2xl relative hidden sm:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                        className="w-full bg-white text-gray-900 border-none pl-10 h-10 rounded-md focus-visible:ring-2 focus-visible:ring-green-400"
                        placeholder="Search for products, brands"
                    />
                </div>

                <div className="flex items-center gap-4 flex-shrink-0 text-sm">
                    <button className="hidden sm:block hover:text-green-400 transition-colors font-medium">Login</button>
                    <button className="flex items-center gap-2 bg-green-500 hover:bg-green-600 px-4 py-2 rounded-md transition-colors font-medium">
                        <span className="hidden sm:inline">My bag</span>
                        <ShoppingBag className="w-5 h-5" />
                        <span className="bg-white text-green-600 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">0</span>
                    </button>
                </div>
            </div>

            {/* Mobile Search Bar */}
            <div className="p-3 bg-[#1f2937] sm:hidden border-t border-gray-700">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                        className="w-full bg-white text-gray-900 border-none pl-9 h-9 text-sm rounded-md"
                        placeholder="Search for products, brands"
                    />
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10">

                {/* Categories Section */}
                <div className="relative">
                    <div className="flex gap-4 sm:gap-8 overflow-x-auto pb-4 scrollbar-hide snap-x">
                        {categories.map((cat, i) => (
                            <div key={i} className="flex flex-col items-center gap-3 min-w-[80px] sm:min-w-[100px] cursor-pointer group snap-center">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-50 rounded-xl flex items-center justify-center text-3xl group-hover:shadow-md group-hover:scale-105 transition-all border border-green-100">
                                    {cat.icon}
                                </div>
                                <span className="text-xs sm:text-sm font-medium text-center text-gray-700">{cat.name}</span>
                            </div>
                        ))}
                    </div>
                    <button className="absolute right-0 top-8 bg-white shadow-md rounded-full p-1 border border-gray-100 hidden sm:block">
                        <ChevronRight className="w-5 h-5 text-gray-600" />
                    </button>
                </div>

                {/* Promo Banners */}
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-[#1e293b] rounded-2xl p-6 text-white relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center min-h-[160px]">
                        <div className="z-10 max-w-[200px]">
                            <h3 className="font-bold text-lg mb-4 text-gray-100 leading-snug">Join our whatsapp community for expert agronomy updates</h3>
                            <Button className="bg-green-500 hover:bg-green-600 text-white border-0 text-sm font-semibold px-6 shadow-sm">Join Now</Button>
                        </div>
                        {/* Mock phone graphic */}
                        <div className="absolute right-0 bottom-0 sm:bottom-auto w-32 sm:w-40 sm:-mr-4 opacity-50 sm:opacity-100">
                            <div className="bg-white/10 w-full h-40 rounded-t-3xl border-t-4 border-l-4 border-r-4 border-gray-700 shadow-2xl translate-y-8 flex items-start justify-center pt-4 overflow-hidden">
                                <div className="w-full h-full bg-green-900/40 px-2">
                                    <div className="h-6 w-full bg-green-500 rounded flex items-center px-2 mb-2"><span className="text-[8px]">WhatsApp</span></div>
                                    <div className="h-4 w-3/4 bg-white/20 rounded mb-1 rounded-bl-none"></div>
                                    <div className="h-4 w-2/3 bg-white/20 rounded ml-auto mb-1 rounded-br-none"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-r from-green-500 to-emerald-400 rounded-2xl p-6 text-white relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center min-h-[160px]">
                        <div className="z-10 max-w-[220px]">
                            <h3 className="font-bold text-lg mb-4 leading-snug">Access more features and products through AgriMitra app</h3>
                            <Button className="bg-[#1e293b] hover:bg-[#0f172a] text-white border-0 text-sm font-semibold px-6 shadow-sm">Download Now</Button>
                        </div>
                        {/* Mock app graphic */}
                        <div className="absolute right-0 bottom-0 sm:bottom-auto w-32 sm:w-40 sm:-mr-4 opacity-50 sm:opacity-100">
                            <div className="bg-white w-full h-40 rounded-t-3xl border-t-4 border-l-4 border-r-4 border-gray-200 shadow-2xl translate-y-8 flex flex-col items-center pt-3 overflow-hidden">
                                <div className="w-12 h-1 bg-gray-300 rounded-full mb-3"></div>
                                <div className="w-full px-3 space-y-2">
                                    <div className="w-full h-12 bg-blue-50 rounded-lg flex items-center p-2"><span className="text-xl">☀️</span></div>
                                    <div className="grid grid-cols-2 gap-1">
                                        <div className="h-10 bg-green-50 rounded"></div>
                                        <div className="h-10 bg-orange-50 rounded"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* This week's trending products */}
                <div>
                    <h2 className="text-xl font-bold mb-6 text-gray-800">This week's trending products</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {trendingProducts.map((p) => (
                            <Card key={p.id} className="border-green-100 hover:border-green-300 transition-colors shadow-sm relative group overflow-hidden">
                                {p.tag && <Badge className="absolute top-2 left-2 bg-green-500 hover:bg-green-600 text-[10px] px-2">{p.tag}</Badge>}
                                <CardContent className="p-4 flex flex-col bg-white">
                                    <div className="h-32 sm:h-40 bg-zinc-50 rounded-lg mb-4 flex items-center justify-center text-5xl group-hover:scale-105 transition-transform">
                                        {p.img}
                                    </div>
                                    <h3 className="font-medium text-sm text-gray-700 line-clamp-2 min-h-[40px] leading-tight mb-2">{p.name}</h3>
                                    <div className="flex items-baseline gap-2 mb-4">
                                        <span className="text-xs text-gray-400 line-through">Rs. {p.oldPrice}</span>
                                        <span className="font-bold text-gray-900">Rs. {p.price}</span>
                                    </div>
                                    <Button variant="outline" className="w-full border-green-200 text-green-600 hover:bg-green-50 hover:text-green-700 rounded-full h-8 text-xs font-semibold uppercase tracking-wider">
                                        + Add
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Shop by brands */}
                <div>
                    <h2 className="text-xl font-bold mb-6 text-gray-800">Shop by brands</h2>
                    <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x">
                        {brands.map((brand, i) => (
                            <div key={i} className="min-w-[140px] h-20 bg-white border border-gray-200 rounded-lg flex items-center justify-center text-gray-500 font-bold text-lg cursor-pointer hover:border-green-400 hover:shadow-sm transition-all snap-center">
                                {brand}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Features Grids */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">

                    {/* Main feature - Crop tracker */}
                    <div className="md:col-span-6 bg-[#212b36] rounded-2xl p-6 md:p-8 text-white relative overflow-hidden flex flex-col justify-between min-h-[300px]">
                        <div className="z-10">
                            <h2 className="text-2xl font-bold mb-2">Crop tracker</h2>
                            <p className="text-gray-400 text-sm">Manage your farm on your fingertips</p>
                        </div>
                        <div className="absolute right-0 md:right-10 bottom-0 translate-y-8 flex justify-center w-full">
                            <div className="bg-white rounded-t-3xl p-2 w-[220px] shadow-2xl border-x-4 border-t-4 border-gray-800">
                                <div className="flex items-center gap-2 border-b pb-2 mb-2">
                                    <ChevronLeft className="w-4 h-4 text-gray-500" />
                                    <span className="text-gray-900 font-semibold text-sm">Crop Tracker</span>
                                </div>
                                <div className="px-2 pb-6 space-y-3">
                                    <div className="text-xs text-gray-400 font-medium">Crops</div>
                                    <div className="flex justify-between items-center text-gray-800 pb-2 border-b border-gray-100">
                                        <div className="flex flex-col items-center"><span className="text-sm">🍅</span><span className="text-[10px]">Tomato</span></div>
                                        <div className="flex flex-col items-center opacity-50"><span className="text-sm">🌶️</span><span className="text-[10px]">Chili</span></div>
                                        <div className="flex flex-col items-center opacity-50"><span className="text-sm">🧅</span><span className="text-[10px]">Onion</span></div>
                                    </div>
                                    <div className="w-full h-24 bg-green-50 rounded-lg border flex items-end justify-around pb-2">
                                        <div className="flex flex-col items-center"><div className="w-1 h-8 bg-green-200 mb-1"></div>🌱</div>
                                        <div className="flex flex-col items-center"><div className="w-1 h-12 bg-green-400 mb-1"></div>🪴</div>
                                        <div className="flex flex-col items-center"><div className="w-1 h-16 bg-green-600 mb-1"></div>🌳</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="md:col-span-6 grid grid-cols-2 gap-4">
                        {/* Personalised agronomy */}
                        <div className="bg-[#212b36] rounded-2xl p-6 text-white relative overflow-hidden flex flex-col justify-between min-h-[160px]">
                            <h3 className="font-bold text-lg mb-4 z-10 w-2/3 leading-snug">Personalised agronomy</h3>
                            <div className="absolute bottom-0 right-0 p-4 opacity-80">
                                <span className="text-6xl">👨‍💻</span>
                            </div>
                        </div>

                        {/* One click payment */}
                        <div className="bg-[#212b36] rounded-2xl p-6 text-white relative overflow-hidden flex flex-col justify-between min-h-[160px]">
                            <h3 className="font-bold text-lg mb-4 z-10 leading-snug">One click payment</h3>
                            <div className="absolute bottom-0 right-2 flex items-end gap-2 translate-y-4">
                                <div className="bg-white rounded-t-xl p-2 w-12 shadow-lg h-20 opacity-90 text-center"><span className="text-[8px] text-gray-800 font-bold block mt-2">UIC</span><div className="w-full h-1 bg-green-500 mt-2 rounded"></div></div>
                                <div className="bg-white rounded-t-xl py-3 px-4 w-16 shadow-lg h-24 flex items-center justify-center -translate-y-2">
                                    <CheckCircle2 className="text-green-500 w-8 h-8" />
                                </div>
                            </div>
                        </div>

                        {/* Free home delivery */}
                        <div className="bg-[#212b36] rounded-2xl p-6 text-white relative overflow-hidden flex flex-col justify-between min-h-[160px]">
                            <h3 className="font-bold text-lg mb-4 z-10 w-2/3 leading-snug">Free home delivery*</h3>
                            <div className="absolute bottom-0 right-2 p-2 translate-y-2 opacity-90">
                                <span className="text-6xl">🚚</span>
                            </div>
                        </div>

                        {/* Download Info */}
                        <div className="bg-[#212b36] rounded-2xl p-6 text-white relative overflow-hidden flex flex-col justify-center min-h-[160px]">
                            <p className="text-xs text-gray-400 mb-2">Download AgriMitra app</p>
                            <div className="bg-black border border-gray-700 p-2 rounded-lg flex items-center gap-2 cursor-pointer max-w-max hover:bg-gray-900 transition-colors">
                                <span className="text-2xl">▶️</span>
                                <div>
                                    <div className="text-[10px] text-gray-400 leading-none">GET IT ON</div>
                                    <div className="text-sm font-bold leading-none">Google Play</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Testimonials */}
                <div className="grid md:grid-cols-2 gap-4">
                    <Card className="border-0 bg-blue-50/50 shadow-sm">
                        <CardContent className="p-6 flex gap-4 items-start">
                            <img src="https://ui-avatars.com/api/?name=Manojkumar&background=0D8ABC&color=fff&size=64&rounded=true" alt="Avatar" className="w-16 h-16 rounded-full" />
                            <div>
                                <h4 className="font-bold text-gray-900 text-sm">Manojkumar</h4>
                                <p className="text-xs text-gray-500 mb-2">Gujarat</p>
                                <p className="text-sm text-gray-700 italic">"Fast delivery and the right price are what I like compared to seeds of farming schemes. I use AgriMitra Delivery services every time I need anything for my farm."</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-0 bg-green-50/50 shadow-sm">
                        <CardContent className="p-6 flex gap-4 items-start">
                            <img src="https://ui-avatars.com/api/?name=Jagdev+Chauhan&background=10B981&color=fff&size=64&rounded=true" alt="Avatar" className="w-16 h-16 rounded-full" />
                            <div>
                                <h4 className="font-bold text-gray-900 text-sm">Jagdev Chauhan</h4>
                                <p className="text-xs text-gray-500 mb-2">Madhya Pradesh</p>
                                <p className="text-sm text-gray-700 italic">"Premium app introduced an art module to check limits in our region. Very easy to compare prices and buy fertilizers."</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Fertilizers Category */}
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-800 border-b-2 border-green-500 pb-1">Fertilizers</h2>
                        <button className="text-sm font-semibold text-green-600 flex items-center gap-1 hover:text-green-700">View all <ChevronRight className="w-4 h-4" /></button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {trendingProducts.map((p) => (
                            <Card key={p.id} className="border-green-100 hover:border-green-300 transition-colors shadow-sm relative group overflow-hidden">
                                {p.tag && <Badge className="absolute top-2 left-2 bg-green-500 hover:bg-green-600 text-[10px] px-2">{p.tag}</Badge>}
                                <CardContent className="p-4 flex flex-col bg-white">
                                    <div className="h-32 sm:h-40 bg-zinc-50 rounded-lg mb-4 flex items-center justify-center text-5xl group-hover:scale-105 transition-transform">
                                        {p.img}
                                    </div>
                                    <h3 className="font-medium text-sm text-gray-700 line-clamp-2 min-h-[40px] leading-tight mb-2">{p.name}</h3>
                                    <div className="flex items-baseline gap-2 mb-4">
                                        <span className="text-xs text-gray-400 line-through">Rs. {p.oldPrice}</span>
                                        <span className="font-bold text-gray-900">Rs. {p.price}</span>
                                    </div>
                                    <Button variant="outline" className="w-full border-green-200 text-green-600 hover:bg-green-50 hover:text-green-700 rounded-full h-8 text-xs font-semibold uppercase tracking-wider">
                                        + Add
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Pesticide Category */}
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-800 border-b-2 border-green-500 pb-1">Pesticide</h2>
                        <button className="text-sm font-semibold text-green-600 flex items-center gap-1 hover:text-green-700">View all <ChevronRight className="w-4 h-4" /></button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {/* Using mock pesticide data */}
                        {[
                            { id: 1, name: "Dhanmet 10%", price: "1,200.00", oldPrice: "1,450.00", img: "🧴" },
                            { id: 2, name: "Pymetrozine Insecticide", price: "520.00", oldPrice: "670.00", img: "🏺" },
                            { id: 3, name: "Zoy Insecticide", price: "480.00", oldPrice: "590.00", img: "🌿" },
                            { id: 4, name: "Coromandel Sprayer 10.5%", price: "690.00", oldPrice: "750.00", img: "🛢️" },
                        ].map((p) => (
                            <Card key={p.id} className="border-green-100 hover:border-green-300 transition-colors shadow-sm relative group overflow-hidden">
                                <Badge className="absolute top-2 left-2 bg-green-500 hover:bg-green-600 text-[10px] px-2">Sale</Badge>
                                <CardContent className="p-4 flex flex-col bg-white">
                                    <div className="h-32 sm:h-40 bg-zinc-50 rounded-lg mb-4 flex items-center justify-center text-5xl group-hover:scale-105 transition-transform">
                                        {p.img}
                                    </div>
                                    <h3 className="font-medium text-sm text-gray-700 line-clamp-2 min-h-[40px] leading-tight mb-2">{p.name}</h3>
                                    <div className="flex items-baseline gap-2 mb-4">
                                        <span className="text-xs text-gray-400 line-through">Rs. {p.oldPrice}</span>
                                        <span className="font-bold text-gray-900">Rs. {p.price}</span>
                                    </div>
                                    <Button variant="outline" className="w-full border-green-200 text-green-600 hover:bg-green-50 hover:text-green-700 rounded-full h-8 text-xs font-semibold uppercase tracking-wider">
                                        + Add
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

            </div>

            <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
        </div>
    );
}
