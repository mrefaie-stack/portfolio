import localFont from "next/font/local";

/**
 * الخط البديل (مستضاف محلياً): IBM Plex Sans Arabic — قريب من طابع Ping AR + LT.
 */
export const fallbackFont = localFont({
  variable: "--font-fallback",
  display: "swap",
  src: [
    { path: "./ibm-plex-sans-arabic/ibm-plex-sans-arabic-arabic-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./ibm-plex-sans-arabic/ibm-plex-sans-arabic-arabic-500-normal.woff2", weight: "500", style: "normal" },
    { path: "./ibm-plex-sans-arabic/ibm-plex-sans-arabic-arabic-600-normal.woff2", weight: "600", style: "normal" },
    { path: "./ibm-plex-sans-arabic/ibm-plex-sans-arabic-arabic-700-normal.woff2", weight: "700", style: "normal" },
    { path: "./ibm-plex-sans-arabic/ibm-plex-sans-arabic-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./ibm-plex-sans-arabic/ibm-plex-sans-arabic-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "./ibm-plex-sans-arabic/ibm-plex-sans-arabic-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "./ibm-plex-sans-arabic/ibm-plex-sans-arabic-latin-700-normal.woff2", weight: "700", style: "normal" },
  ],
});

/**
 * الخط الأصلي في التصميم: "Ping AR + LT" (Bold 64/80 للعناوين، Regular 24/36 للنص).
 *
 * لتفعيله:
 * 1) ضع ملفات الخط داخل `src/fonts/ping-ar/` بالأسماء:
 *      PingAR+LT-Regular.woff2 , PingAR+LT-Medium.woff2 , PingAR+LT-Bold.woff2
 * 2) أزل التعليق عن الكود أدناه، ثم في `src/app/layout.tsx` أضف `pingFont.variable` إلى className الخاص بـ <html>.
 */
// export const pingFont = localFont({
//   variable: "--font-ping",
//   display: "swap",
//   src: [
//     { path: "./ping-ar/PingAR+LT-Regular.woff2", weight: "400", style: "normal" },
//     { path: "./ping-ar/PingAR+LT-Medium.woff2", weight: "500", style: "normal" },
//     { path: "./ping-ar/PingAR+LT-Bold.woff2", weight: "700", style: "normal" },
//   ],
// });
