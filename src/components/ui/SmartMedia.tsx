import Image from "next/image";
import { isEmbed, isExternal, isVideo, videoMime } from "@/lib/media";
import { cn } from "@/lib/cn";

/**
 * يعرض أي وسيط داخل حاوية `relative` ويملأها:
 * إطار Drive مضمّن، أو فيديو، أو صورة خارجية، أو صورة مرفوعة عندنا (محسّنة عبر next/image).
 */
export function SmartMedia({
  src,
  alt = "",
  sizes,
  priority,
  fit = "cover",
  className,
  controls = true,
}: {
  src: string;
  alt?: string;
  sizes?: string;
  priority?: boolean;
  fit?: "cover" | "contain";
  className?: string;
  controls?: boolean;
}) {
  const object = fit === "cover" ? "object-cover" : "object-contain";

  if (isEmbed(src)) {
    return (
      <iframe
        src={src}
        title={alt || "فيديو"}
        className={cn("absolute inset-0 h-full w-full border-0", className)}
        allow="autoplay; fullscreen; encrypted-media"
        allowFullScreen
        loading="lazy"
      />
    );
  }

  if (isVideo(src)) {
    return (
      <video
        className={cn("absolute inset-0 h-full w-full bg-black", object, className)}
        controls={controls}
        playsInline
        preload="metadata"
      >
        <source src={src} type={videoMime(src)} />
      </video>
    );
  }

  if (isExternal(src)) {
    return (
      // روابط خارجية لا تمرّ على محسّن الصور (قد تُعيد توجيهاً أو تتغيّر)
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        className={cn("absolute inset-0 h-full w-full", object, className)}
      />
    );
  }

  return <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className={cn(object, className)} />;
}
