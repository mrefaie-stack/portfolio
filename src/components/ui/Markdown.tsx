import type { ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Element, ElementContent } from "hast";
import { cn } from "@/lib/cn";
import { ArticleMedia, type MediaItem } from "./ArticleMedia";

/** يضم أسطر الصور/الفيديو المتتابعة (حتى لو بينها سطر فارغ) في فقرة واحدة → تُعرض كسلايدر */
function groupConsecutiveMedia(md: string) {
  const line = String.raw`!\[[^\]]*\]\([^)\s]+\)`;
  const re = new RegExp(`(${line})[ \\t]*\\n(?:[ \\t]*\\n)+(?=[ \\t]*${line})`, "g");
  return md.replace(re, "$1\n");
}

function mediaFromParagraph(node: Element | undefined): MediaItem[] | null {
  if (!node) return null;
  const kids = (node.children as ElementContent[]).filter(
    (c) => !(c.type === "text" && c.value.trim() === ""),
  );
  if (kids.length === 0) return null;
  const items: MediaItem[] = [];
  for (const k of kids) {
    if (k.type !== "element" || k.tagName !== "img") return null;
    const src = String(k.properties?.src ?? "");
    if (!src) return null;
    items.push({ src, alt: String(k.properties?.alt ?? "") });
  }
  return items;
}

/**
 * عرض المقالة (Markdown → HTML) بتنسيق موحد `.prose-mk` من globals.css.
 * الصور والفيديو داخل النص تُعرض في إطار موحّد، والمتتابعة منها كسلايدر.
 */
export function Markdown({ content, className }: { content: string; className?: string }) {
  return (
    <div className={cn("prose-mk", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noreferrer">
              {children}
            </a>
          ),
          p: ({ node, children }) => {
            const items = mediaFromParagraph(node);
            if (items) return <ArticleMedia items={items} />;
            return <p>{children as ReactNode}</p>;
          },
          img: ({ src, alt }) => (
            <ArticleMedia items={[{ src: typeof src === "string" ? src : "", alt: alt ?? "" }]} />
          ),
        }}
      >
        {groupConsecutiveMedia(content)}
      </ReactMarkdown>
    </div>
  );
}
