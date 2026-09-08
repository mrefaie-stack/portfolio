import Link from "next/link";
import { cn } from "@/lib/cn";

type Props = {
  href?: string;
  variant?: "primary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md";
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  external?: boolean;
};

export function Button({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
  onClick,
  type = "button",
  disabled,
  external,
}: Props) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60",
    size === "md" ? "h-12 px-6 text-[15px]" : "h-9 px-3.5 text-sm",
    variant === "primary" && "bg-brand text-white hover:bg-[#e62d00]",
    variant === "outline" && "border border-border bg-surface text-ink hover:bg-surface-2",
    variant === "ghost" && "text-ink-2 hover:bg-surface-2 hover:text-ink",
    variant === "danger" && "bg-red-600/10 text-red-700 hover:bg-red-600/15 dark:text-red-300",
    className,
  );

  if (href) {
    if (external) {
      return (
        <a href={href} target="_blank" rel="noreferrer" className={classes}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} onClick={onClick} className={classes} disabled={disabled}>
      {children}
    </button>
  );
}
