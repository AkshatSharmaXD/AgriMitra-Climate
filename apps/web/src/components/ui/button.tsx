"use client";

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const button = cva(
  [
    "inline-flex items-center justify-center gap-2 rounded-md font-medium",
    "min-h-tap select-none whitespace-nowrap",
    // Feedback lands on pointer-down, not on click.
    "transition-[transform,background-color,color,border-color] duration-100 ease-out-quint",
    "active:scale-[0.98]",
    "disabled:pointer-events-none disabled:opacity-45",
  ],
  {
    variants: {
      variant: {
        primary: "bg-accent text-accent-content hover:bg-accent-hover",
        secondary: "bg-surface-raised text-content border border-hairline hover:bg-surface-sunken",
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
