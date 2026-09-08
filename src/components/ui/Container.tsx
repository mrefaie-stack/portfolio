import { cn } from "@/lib/cn";

/** الحاوية الرئيسية: 1920 كحد أقصى مع padding 140 على الشاشات الكبيرة (كما في Figma) */
export function Container({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("mx-auto w-full max-w-[1920px] px-4 sm:px-8 xl:px-[140px]", className)}>{children}</div>;
}
