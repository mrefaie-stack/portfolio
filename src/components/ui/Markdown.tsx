import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/cn";

/**
 * عرض المقالة (Markdown → HTML) بتنسيق موحد `.prose-mk` من globals.css.
 * الروابط تفتح في تبويب جديد، والصور تأخذ العرض كاملاً بحواف دائرية.
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
          // eslint-disable-next-line @next/next/no-img-element
          img: ({ src, alt }) => <img src={typeof src === "string" ? src : ""} alt={alt ?? ""} loading="lazy" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
