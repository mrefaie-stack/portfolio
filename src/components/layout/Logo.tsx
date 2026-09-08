import Image from "next/image";
import Link from "next/link";

/**
 * شعار "ميلا نايتس" — رأس حصان (Knight) باللون البرتقالي على قاعدة سوداء.
 * استبدل `public/images/logo.png` بملف SVG الرسمي عند توفره.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" aria-label="ميلا نايتس — الصفحة الرئيسية" className={className}>
      <Image
        src="/images/logo.png"
        alt="Mila Knights"
        width={110}
        height={123}
        priority
        className="h-12 w-auto lg:h-[62px]"
      />
    </Link>
  );
}
