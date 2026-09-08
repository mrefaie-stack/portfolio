import { cn } from "@/lib/cn";

export function Chip({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-lg bg-surface-2 px-3.5 py-2 text-[13px] leading-none text-ink-2 lg:text-sm",
        className,
      )}
    >
      {children}
    </span>
  );
}
