import type { Stat } from "@/lib/types";
import { cn } from "@/lib/cn";

/**
 * شريط الإحصائيات الرمادي — الأرقام باللون البرتقالي والتسمية تحتها.
 * لا يظهر إلا عند وجود أرقام فعلية (الكروت الخارجية لا تستخدمه).
 */
export function StatTiles({ stats, size = "md", className }: { stats: Stat[]; size?: "sm" | "md"; className?: string }) {
  if (!stats.length) return null;
  const cols = Math.min(stats.length, 4);
  return (
    <div
      className={cn("grid overflow-hidden rounded-xl bg-surface-2", className)}
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {stats.map((s, i) => (
        <div
          key={`${s.label}-${i}`}
          className={cn(
            "flex flex-col items-start gap-1 text-start",
            size === "md" ? "px-5 py-4" : "px-4 py-3",
            i !== 0 && "border-r border-border/80",
          )}
        >
          <span
            className={cn(
              "tabular font-bold leading-none text-brand",
              size === "md" ? "text-[22px] lg:text-[26px]" : "text-base lg:text-[17px]",
            )}
          >
            {s.value}
          </span>
          <span className={cn("leading-tight text-ink-2", size === "md" ? "text-sm" : "text-xs")}>{s.label}</span>
        </div>
      ))}
    </div>
  );
}
