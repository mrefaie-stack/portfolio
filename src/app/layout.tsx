import type { Metadata } from "next";
import { fallbackFont } from "@/fonts";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

export const metadata: Metadata = {
  title: { default: "MilaKnight", template: "%s | MilaKnight" },
  applicationName: "MilaKnight",
  icons: { icon: "/icon.png", apple: "/apple-icon.png" },
  description:
    "وكالة تسويق رقمية تولّد الظهور، التفاعل، والمتابعين، وتوثّق أثر كل ملف أعمال كقضية ناجحة موثّقة.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl" className={fallbackFont.variable} suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
