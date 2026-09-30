"use client";

import * as React from "react";
import { Bot, X } from "lucide-react";
import { usePathname } from "next/navigation";

export function Chatbots() {
  const pathname = usePathname();
  const [leftOpen, setLeftOpen] = React.useState(true);
  const [rightOpen, setRightOpen] = React.useState(true);

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 pointer-events-none p-4 pb-20 md:pb-6 flex justify-between items-end">
      {/* Left Chatbot - Bharati */}
      <div className="pointer-events-auto flex flex-col items-start gap-2 max-w-[200px]">
        {leftOpen && (
          <div className="bg-[#1a365d] text-white p-3 rounded-lg rounded-bl-none text-[11px] shadow-lg relative animate-fade-in font-sans">
            <button 
              onClick={() => setLeftOpen(false)} 
              className="absolute -top-2 -right-2 bg-white text-black rounded-full p-0.5 shadow hover:bg-gray-100 flex items-center justify-center"
            >
              <X className="size-3" />
            </button>
            Hello, I am Bharati, your AI agriculture assistant.
          </div>
        )}
        <button 
          onClick={() => setLeftOpen(!leftOpen)}
          className="size-14 rounded-full bg-white border-2 border-green-600 shadow-xl overflow-hidden hover:scale-105 transition-transform flex items-center justify-center relative group"
        >
          <img 
            src="https://api.dicebear.com/7.x/notionists/svg?seed=Bharati&backgroundColor=e6f6e6" 
            alt="Bharati Avatar" 
            className="w-full h-full object-cover"
          />
        </button>
      </div>

      {/* Right Chatbot - Krishi Rakshak */}
      <div className="pointer-events-auto flex flex-col items-end gap-2 max-w-[200px]">
        {rightOpen && (
          <div className="bg-[#1e4620] text-white p-3 rounded-lg rounded-br-none text-[11px] shadow-lg relative animate-fade-in font-sans text-right">
            <button 
              onClick={() => setRightOpen(false)} 
              className="absolute -top-2 -left-2 bg-white text-black rounded-full p-0.5 shadow hover:bg-gray-100 flex items-center justify-center"
            >
              <X className="size-3" />
            </button>
            Hi, I am your Krishi Rakshak. How may I help you?
          </div>
        )}
        <button 
          onClick={() => setRightOpen(!rightOpen)}
          className="size-14 rounded-full bg-[#1e4620] border-2 border-white shadow-xl hover:scale-105 transition-transform flex items-center justify-center text-white relative group"
        >
          <Bot className="size-8" />
        </button>
      </div>
    </div>
  );
}
