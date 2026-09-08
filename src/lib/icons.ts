import type { LucideIcon } from "lucide-react";
import {
  HeartPulse,
  GraduationCap,
  UtensilsCrossed,
  ShoppingBasket,
  Car,
  Sparkles,
  Coffee,
  Gavel,
  Building2,
  Stethoscope,
  Dumbbell,
  Plane,
  Home,
  Shirt,
  Smartphone,
  Briefcase,
  Palette,
  Camera,
  Baby,
  Landmark,
  Wrench,
  Leaf,
  Gem,
  Globe,
  FolderOpen,
} from "lucide-react";

/** الأيقونات المسموح بها للتصنيفات — تُخزَّن بالاسم في JSON وتُحل هنا */
export const iconMap = {
  HeartPulse,
  GraduationCap,
  UtensilsCrossed,
  ShoppingBasket,
  Car,
  Sparkles,
  Coffee,
  Gavel,
  Building2,
  Stethoscope,
  Dumbbell,
  Plane,
  Home,
  Shirt,
  Smartphone,
  Briefcase,
  Palette,
  Camera,
  Baby,
  Landmark,
  Wrench,
  Leaf,
  Gem,
  Globe,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof iconMap;
export const iconNames = Object.keys(iconMap) as IconName[];

export function getIcon(name: string): LucideIcon {
  return (iconMap as Record<string, LucideIcon>)[name] ?? FolderOpen;
}
