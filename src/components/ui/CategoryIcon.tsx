import { createElement } from "react";
import { getIcon } from "@/lib/icons";

/** يحل اسم الأيقونة المخزَّن في JSON إلى مكوّن lucide */
export function CategoryIcon({ name, className, strokeWidth = 1.75 }: { name: string; className?: string; strokeWidth?: number }) {
  return createElement(getIcon(name), { className, strokeWidth });
}
