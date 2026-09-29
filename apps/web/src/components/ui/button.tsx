"use client";

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const button = cva(
  [
    "inline-flex items-center justify-center gap-2 rounded-xl font-medium",
    "min-h-tap select-none whitespace-nowrap relative overflow-hidden",
    // Feedback lands on pointer-down, not on click.
    "transition-all duration-200 ease-out-quint",
    "active:scale-[0.97]",
    "disabled:pointer-events-none disabled:opacity-45",
  ],
  {
    variants: {
      variant: {
        primary: "bg-gradient-to-r from-accent to-accent-hover text-accent-content shadow-md shadow-accent/20 hover:shadow-lg hover:-translate-y-0.5 before:absolute before:inset-0 before:bg-white/10 before:opacity-0 hover:before:opacity-100 before:transition-opacity",
        secondary: "bg-surface-raised/80 backdrop-blur-md text-content border border-hairline hover:bg-surface-sunken hover:shadow-sm hover:-translate-y-0.5",
        ghost: "text-content-secondary hover:bg-surface-sunken hover:text-content",
        quiet: "text-accent hover:bg-accent-soft",
      },
      size: {
        md: "px-4 py-2.5 type-callout",
        lg: "px-5 py-3.5 type-body",
        icon: "size-11 p-0",
      },
      block: { true: "w-full", false: "" },
    },
    defaultVariants: { variant: "primary", size: "md", block: false },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof button> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, block, asChild = false, ...props }, ref) => {
    const Component = asChild ? Slot : "button";
    return (
      <Component
        ref={ref}
        className={cn(button({ variant, size, block }), className)}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
