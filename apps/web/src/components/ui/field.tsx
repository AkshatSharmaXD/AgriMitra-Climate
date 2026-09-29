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
      "min-h-tap w-full rounded-md border bg-surface-raised px-3.5 py-2.5 type-body text-content",
      "placeholder:text-content-tertiary",
      "transition-colors duration-100",
      invalid ? "border-risk-high" : "border-hairline focus:border-accent",
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
              "min-h-tap rounded-md border px-4 py-2 type-callout font-medium",
              "transition-colors duration-100 active:scale-[0.98]",
              selected
                ? "border-accent bg-accent text-accent-content"
                : "border-hairline bg-surface-raised text-content-secondary hover:bg-surface-sunken",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
