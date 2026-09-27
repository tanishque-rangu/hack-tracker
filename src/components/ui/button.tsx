import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "subtle";
  size?: "sm" | "md" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, disabled, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-50 disabled:pointer-events-none select-none rounded-lg cursor-pointer";

    const variantStyles = {
      primary: "bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-950/40 active:scale-[0.98]",
      secondary: "bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700 active:scale-[0.98]",
      outline: "border border-zinc-700 hover:bg-zinc-800/80 text-zinc-200 active:scale-[0.98]",
      ghost: "hover:bg-zinc-800/60 text-zinc-300 hover:text-zinc-100",
      danger: "bg-rose-600 hover:bg-rose-500 text-white active:scale-[0.98]",
      subtle: "bg-indigo-950/40 hover:bg-indigo-900/50 text-indigo-300 border border-indigo-800/40",
    };

    const sizeStyles = {
      sm: "text-xs px-2.5 py-1.5 gap-1.5 h-8",
      md: "text-sm px-3.5 py-2 gap-2 h-9",
      lg: "text-sm px-4 py-2.5 gap-2.5 h-11 font-semibold",
      icon: "h-9 w-9 p-0",
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
