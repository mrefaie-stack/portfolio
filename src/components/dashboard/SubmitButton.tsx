"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

export function SubmitButton({
  children,
  className,
  variant = "primary",
  pendingText = "جارٍ الحفظ…",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "outline" | "danger";
  pendingText?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 rounded-lg px-5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60",
        variant === "primary" && "bg-brand text-white hover:bg-[#e62d00]",
        variant === "outline" && "border border-border bg-surface text-ink hover:bg-surface-2",
        variant === "danger" && "bg-red-600 text-white hover:bg-red-700",
        className,
      )}
    >
      {pending && <Loader2 className="size-4 animate-spin" />}
      {pending ? pendingText : children}
    </button>
  );
}
