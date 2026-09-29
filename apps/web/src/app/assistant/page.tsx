"use client";

import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import * as React from "react";
import { Loader2, Mic, Send, Square, Volume2 } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState, ErrorState } from "@/components/ui/states";
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
  { value: "en", label: "EN" },
  { value: "hi", label: "हि" },
  { value: "gu", label: "ગુ" },
  { value: "te", label: "తె" },
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
      <>
        <PageHeader title="Assistant" />
        <EmptyState
          title="Register a farm first"
          description="The assistant answers only from your own farm record, so it needs one to read."
          action={
            <Button asChild>
              <Link href="/farm/new">Register your farm</Link>
            </Button>
          }
        />
      </>
    );
  }

  return (
    <div className="flex min-h-[80dvh] flex-col">
      <PageHeader
        title="Assistant"
        description="Answers come only from your recorded farm data. Nothing is estimated."
      />

      <div role="radiogroup" aria-label="Language" className="mb-4 flex gap-2">
        {LANGUAGES.map((option) => (
          <Button
            key={option.value}
            role="radio"
            aria-checked={language === option.value}
            variant={language === option.value ? "primary" : "secondary"}
            onClick={() => setLanguage(option.value)}
          >
            {option.label}
          </Button>
        ))}
      </div>

      <div className="flex-1 space-y-3" aria-live="polite">
        {turns.length === 0 ? (
          <EmptyState
            title="Ask about your field"
            description="“Should I irrigate this week?” · “Why is my risk high?” · “What should I watch for?”"
          />
        ) : null}

        {turns.map((turn, index) => (
          <div
            key={index}
            className={cn("flex", turn.role === "user" ? "justify-end" : "justify-start")}
          >
            <div
              className={cn(
                "max-w-[85%] rounded-lg px-4 py-3 type-callout",
                turn.role === "user"
                  ? "bg-accent text-accent-content"
                  : "border border-hairline bg-surface-raised text-content",
              )}
            >
              {turn.content}
              {turn.role === "assistant" && turn.answerable === false ? (
                <p className="mt-2 border-t border-hairline pt-2 type-caption text-content-tertiary">
                  Your farm record does not contain what this question needs.
                </p>
              ) : null}
              {turn.role === "assistant" && canSpeak ? (
                <button
                  type="button"
                  onClick={() => speak(turn.content, language)}
                  className="mt-2 flex min-h-tap items-center gap-1.5 type-caption font-medium text-accent"
                >
                  <Volume2 aria-hidden className="size-4" />
                  Read aloud
                </button>
              ) : null}
            </div>
          </div>
        ))}

        {ask.isPending ? (
          <div className="flex justify-start">
            <div className="rounded-lg border border-hairline bg-surface-raised px-4 py-3">
              <Loader2 aria-hidden className="size-5 animate-spin text-accent" />
              <span className="sr-only">Thinking</span>
            </div>
          </div>
        ) : null}

        {ask.isError ? (
          <ErrorState title="No answer" detail={(ask.error as Error).message} />
        ) : null}

        {micError ? <ErrorState title="Microphone" detail={micError} /> : null}

        <div ref={endRef} />
      </div>

      <Card className="sticky bottom-24 mt-4 flex items-end gap-2 p-3">
        <label htmlFor="ask" className="sr-only">
          Your question
        </label>
        <textarea
          id="ask"
          rows={1}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit(draft);
            }
          }}
          placeholder={listening ? "Listening…" : "Ask about your field"}
          className="max-h-32 min-h-tap flex-1 resize-none bg-transparent px-2 py-2.5 type-body text-content placeholder:text-content-tertiary focus:outline-none"
        />
        {canListen ? (
          <Button
            size="icon"
            variant={listening ? "primary" : "ghost"}
            aria-label={listening ? "Stop listening" : "Ask by voice"}
            aria-pressed={listening}
            onClick={toggleMic}
          >
            {listening ? (
              <Square aria-hidden className="size-5" />
            ) : (
              <Mic aria-hidden className="size-5" />
            )}
          </Button>
        ) : null}
        <Button
          size="icon"
          aria-label="Send"
          disabled={!draft.trim() || ask.isPending}
          onClick={() => submit(draft)}
        >
          <Send aria-hidden className="size-5" />
        </Button>
      </Card>
    </div>
  );
}
