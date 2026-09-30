"use client";

import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import * as React from "react";
import { Loader2, Mic, Send, Square, Volume2, Bot, User, PhoneCall } from "lucide-react";

import { api, type Language } from "@/lib/api";
import { useActiveFarmId } from "@/lib/active-farm";
import {
  isRecognitionSupported,
  isSynthesisSupported,
  listen,
  speak,
  stopSpeaking,
  type Recognizer,
} from "@/lib/speech";
import { cn } from "@/lib/utils";

const LANGUAGES: { value: Language; label: string }[] = [
  { value: "en", label: "English" },
  { value: "hi", label: "हिंदी" },
  { value: "gu", label: "ગુજરાતી" },
  { value: "te", label: "తెలుగు" },
];

interface Turn {
  role: "user" | "assistant";
  content: string;
  answerable?: boolean;
}

export default function AssistantPage() {
  const { farmId, ready } = useActiveFarmId();
  const [language, setLanguage] = React.useState<Language>("en");
  const [turns, setTurns] = React.useState<Turn[]>([]);
  const [draft, setDraft] = React.useState("");
  const [listening, setListening] = React.useState(false);
  const [micError, setMicError] = React.useState<string | null>(null);
  const recognizer = React.useRef<Recognizer | null>(null);
  const endRef = React.useRef<HTMLDivElement>(null);

  const [canListen, setCanListen] = React.useState(false);
  const [canSpeak, setCanSpeak] = React.useState(false);
  React.useEffect(() => {
    setCanListen(isRecognitionSupported());
    setCanSpeak(isSynthesisSupported());
    return () => stopSpeaking();
  }, []);

  React.useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [turns]);

  const ask = useMutation({
    mutationFn: (message: string) =>
      api.chat({
        farm_id: farmId!,
        message,
        language,
        history: turns.map(({ role, content }) => ({ role, content })),
      }),
    onSuccess: (response) => {
      setTurns((prev) => [
        ...prev,
        { role: "assistant", content: response.answer, answerable: response.answerable },
      ]);
      if (canSpeak) speak(response.answer, language);
    },
  });

  function submit(message: string) {
    const text = message.trim();
    if (!text || !farmId) return;
    setTurns((prev) => [...prev, { role: "user", content: text }]);
    setDraft("");
    ask.mutate(text);
  }

  function toggleMic() {
    setMicError(null);
    if (listening) {
      recognizer.current?.stop();
      setListening(false);
      return;
    }
    const started = listen(language, {
      onTranscript: (text) => submit(text),
      onError: (message) => {
        setMicError(message);
        setListening(false);
      },
      onEnd: () => setListening(false),
    });
    if (!started) {
      setMicError("This browser has no speech recognition. Type your question instead.");
      return;
    }
    recognizer.current = started;
    setListening(true);
  }

  if (ready && !farmId) {
    return (
      <div className="font-sans min-h-screen bg-[#f5f5f5] flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border-t-4 border-[#2e7d32]">
          <div className="size-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bot className="size-8" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Registration Required</h2>
          <p className="text-gray-600 mb-6 text-sm leading-relaxed">
            AgriMitra AI provides hyper-personalized advice based on your exact farm profile. Please register your farm first.
          </p>
          <Link href="/onboarding" className="bg-[#2e7d32] text-white font-bold py-3 px-6 rounded-xl block w-full hover:bg-[#1b3a1b] transition-colors">
            Register Farm
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="font-sans min-h-[calc(100vh-140px)] bg-[#e8f5e9] flex flex-col">
      {/* Header */}
      <div className="bg-[#1b3a1b] py-6 px-4 md:px-8 border-b-4 border-yellow-400 shrink-0">
        <div className="mx-auto max-w-4xl flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white flex items-center gap-3">
              <Bot className="size-8 text-yellow-300" />
              AgriMitra AI Assistant
            </h1>
            <p className="text-white/80 mt-1 text-sm hidden md:block">Your personal 24/7 agricultural expert. Multilingual & Voice Enabled.</p>
          </div>
          
          <div className="flex bg-white/10 rounded-lg p-1">
            {LANGUAGES.map((option) => (
              <button
                key={option.value}
                onClick={() => setLanguage(option.value)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-bold transition-all",
                  language === option.value ? "bg-white text-[#1b3a1b] shadow-sm" : "text-white/70 hover:text-white"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 w-full max-w-4xl mx-auto p-4 flex flex-col min-h-0 relative">
        <div className="flex-1 overflow-y-auto bg-white rounded-2xl shadow-sm border border-gray-200 p-4 md:p-6 mb-4 flex flex-col gap-4">
          
          {turns.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-70">
              <div className="size-20 bg-green-50 rounded-full flex items-center justify-center mb-4">
                <Bot className="size-10 text-[#2e7d32]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Ask me anything about your farm</h3>
              <p className="text-sm text-gray-500 max-w-xs">
                "Should I irrigate today?"<br/>
                "What is my crop risk?"<br/>
                "How to apply fertilizer?"
              </p>
            </div>
          ) : null}

          {turns.map((turn, index) => (
            <div key={index} className={cn("flex w-full", turn.role === "user" ? "justify-end" : "justify-start")}>
              <div className={cn(
                "max-w-[85%] md:max-w-[75%] rounded-2xl p-4 shadow-sm",
                turn.role === "user" 
                  ? "bg-[#2e7d32] text-white rounded-br-none" 
                  : "bg-gray-100 text-gray-800 rounded-bl-none border border-gray-200"
              )}>
                <div className="flex items-center gap-2 mb-2 opacity-70">
                  {turn.role === "user" ? <User className="size-4" /> : <Bot className="size-4" />}
                  <span className="text-xs font-bold uppercase tracking-wider">{turn.role}</span>
                </div>
                <div className="text-sm leading-relaxed whitespace-pre-wrap">
                  {turn.content}
                </div>
                
                {turn.role === "assistant" && turn.answerable === false && (
                  <div className="mt-3 bg-red-100 border border-red-200 rounded p-2 text-xs font-bold text-red-700">
                    Your farm record doesn't have enough data to answer this precisely.
                  </div>
                )}
                
                {turn.role === "assistant" && canSpeak && (
                  <button 
                    onClick={() => speak(turn.content, language)}
                    className="mt-3 flex items-center gap-1.5 text-xs font-bold text-[#023e8a] hover:underline"
                  >
                    <Volume2 className="size-3.5" /> Read Aloud
                  </button>
                )}
              </div>
            </div>
          ))}

          {ask.isPending && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-2xl rounded-bl-none p-4 flex items-center gap-3">
                <Loader2 className="size-5 animate-spin text-[#2e7d32]" />
                <span className="text-sm font-bold text-gray-500">AgriMitra is thinking...</span>
              </div>
            </div>
          )}

          {ask.isError && (
            <div className="flex justify-center">
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700 font-bold">
                Error: {(ask.error as Error).message}
              </div>
            </div>
          )}

          {micError && (
            <div className="flex justify-center">
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 text-sm text-orange-700 font-bold">
                Mic Error: {micError}
              </div>
            </div>
          )}

          <div ref={endRef} className="h-4" />
        </div>

        {/* Input Area */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-2 flex items-end gap-2 shrink-0">
          <textarea
            rows={1}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit(draft);
              }
            }}
            placeholder={listening ? "Listening to your voice..." : "Type your agricultural query..."}
            className="flex-1 max-h-32 min-h-[44px] bg-transparent resize-none outline-none py-3 px-4 text-sm text-gray-900 placeholder:text-gray-400"
          />
          
          {canListen && (
            <button
              onClick={toggleMic}
              className={cn(
                "shrink-0 size-12 rounded-xl flex items-center justify-center transition-colors",
                listening ? "bg-red-500 text-white animate-pulse shadow-inner" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              {listening ? <Square className="size-5" /> : <Mic className="size-5" />}
            </button>
          )}

          <button
            disabled={!draft.trim() || ask.isPending}
            onClick={() => submit(draft)}
            className="shrink-0 size-12 bg-[#2e7d32] text-white rounded-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#1b3a1b] transition-colors shadow-md"
          >
            <Send className="size-5 ml-1" />
          </button>
        </div>
        
        {/* Support Banner below input */}
        <div className="mt-4 flex items-center justify-center gap-4 text-xs font-bold text-gray-500">
           <span>or call Kisan Helpline: 14447</span>
           <span>•</span>
           <span>WhatsApp: 9978158483</span>
        </div>
      </div>
    </div>
  );
}
