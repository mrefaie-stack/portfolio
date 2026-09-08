import { cn } from "@/lib/cn";

export function StatusBadge({ status }: { status: "draft" | "published" }) {
  const published = status === "published";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        published ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" : "bg-surface-2 text-ink-2",
      )}
    >
      <span className={cn("size-1.5 rounded-full", published ? "bg-emerald-500" : "bg-ink-3")} />
      {published ? "منشور" : "مسودّة"}
    </span>
  );
}
