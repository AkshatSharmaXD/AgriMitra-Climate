"use client";

import * as LabelPrimitive from "@radix-ui/react-label";
import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * One labelled input. Validation is shown inline as the farmer types, never only
 * on submit (`entering-data.md › Validate dynamically`). The error is wired to the
 * control with aria-describedby so a screen reader announces it.
 */
export function Field({
  label,
  hint,
  error,
  children,
  htmlFor,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  htmlFor: string;
}) {
  const hintId = hint ? `${htmlFor}-hint` : undefined;
  const errorId = error ? `${htmlFor}-error` : undefined;

  return (
    <div className="space-y-1.5">
      <LabelPrimitive.Root htmlFor={htmlFor} className="type-callout block font-medium text-content">
        {label}
      </LabelPrimitive.Root>
      {hint ? (
        <p id={hintId} className="type-caption text-content-secondary">
          {hint}
        </p>
      ) : null}
      {children}
      {error ? (
        <p id={errorId} role="alert" className="type-caption font-medium text-risk-high">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }
>(({ className, invalid, ...props }, ref) => (
  <input
    ref={ref}
    aria-invalid={invalid || undefined}
    className={cn(
      "min-h-tap w-full rounded-xl border bg-white/50 dark:bg-black/20 px-4 py-3 type-body text-content shadow-sm",
      "placeholder:text-content-tertiary focus:bg-white/80 dark:focus:bg-black/40",
      "transition-all duration-200 outline-none",
      invalid ? "border-risk-high ring-1 ring-risk-high/50" : "border-hairline/70 focus:border-accent focus:ring-1 focus:ring-accent/50 hover:border-hairline",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";

/**
 * A segmented chooser. Offers choices instead of free text wherever the set is
 * small and known — soil moisture, season, irrigation, N/P/K.
 */
export function Segmented<T extends string>({
  name,
  options,
  value,
  onChange,
  allowClear = false,
}: {
  name: string;
  options: readonly { value: T; label: string }[];
  value: T | null;
  onChange: (value: T | null) => void;
  allowClear?: boolean;
}) {
  return (
    <div role="radiogroup" aria-label={name} className="flex flex-wrap gap-2">
      {options.map((option) => {
        const selected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(selected && allowClear ? null : option.value)}
            className={cn(
              "min-h-tap rounded-xl border px-4 py-2 type-callout font-medium",
              "transition-all duration-200 active:scale-[0.97]",
              selected
                ? "border-accent bg-accent text-accent-content shadow-md shadow-accent/20"
                : "border-hairline/70 bg-white/40 dark:bg-black/20 text-content-secondary hover:bg-white/80 dark:hover:bg-black/40 hover:text-content",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
