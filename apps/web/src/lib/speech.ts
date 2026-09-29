"use client";

/**
 * Web Speech API wrappers.
 *
 * Real speech recognition and real synthesis, or an honest fallback to typing.
 * The previous voice page ran a `setTimeout`, pretended to hear a question the
 * farmer never asked, and answered it with an invented cotton price (audit A2).
 * Nothing here simulates listening.
 */

import type { Language } from "@/lib/api";

const BCP47: Record<Language, string> = {
  en: "en-IN",
  hi: "hi-IN",
  gu: "gu-IN",
  te: "te-IN",
};

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
};

function getRecognitionConstructor(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as Record<string, unknown>;
  return (w.SpeechRecognition ?? w.webkitSpeechRecognition) as
    | (new () => SpeechRecognitionLike)
    | null;
}

export function isRecognitionSupported(): boolean {
  return getRecognitionConstructor() !== null;
}

export function isSynthesisSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export interface Recognizer {
  stop: () => void;
}

/** Starts listening. Returns null when the browser has no recognition engine. */
export function listen(
  language: Language,
  handlers: {
    onTranscript: (text: string) => void;
    onError: (message: string) => void;
    onEnd: () => void;
  },
): Recognizer | null {
  const Constructor = getRecognitionConstructor();
  if (!Constructor) return null;

  const recognition = new Constructor();
  recognition.lang = BCP47[language];
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onresult = (event) => {
    const transcript = event.results[0]?.[0]?.transcript?.trim();
    if (transcript) handlers.onTranscript(transcript);
  };
  recognition.onerror = (event) => {
    handlers.onError(
      event.error === "not-allowed"
        ? "Microphone permission was declined. Type your question instead."
        : "Speech was not recognised. Try again, or type your question.",
    );
  };
  recognition.onend = handlers.onEnd;

  recognition.start();
  return { stop: () => recognition.stop() };
}

export function speak(text: string, language: Language): void {
  if (!isSynthesisSupported()) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = BCP47[language];
  utterance.rate = 0.95;
  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking(): void {
  if (isSynthesisSupported()) window.speechSynthesis.cancel();
}
