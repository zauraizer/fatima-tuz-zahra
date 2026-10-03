import { Fragment } from "react";
import { site, type Num, type Rich, type Text } from "../content";

export const isDraft = (v: Text): boolean => typeof v !== "string";
export const textOf = (v: Text): string => (typeof v === "string" ? v : v.value);
/** True while a link is still a placeholder, empty, or not a real web address. */
export const linkMissing = (v: Text): boolean => isDraft(v) || !/^https?:\/\/[^/\s]+\.[^\s]+$/.test(textOf(v).trim());

/** Wrap ﷺ so it renders in the Arabic font at a legible size. */
function withHonorifics(s: string) {
  if (!s.includes("ﷺ")) return s;
  return s.split("ﷺ").map((part, i, all) => (
    <Fragment key={i}>
      {part}
      {i < all.length - 1 && (
        <span className="honorific" lang="ar">
          ﷺ
        </span>
      )}
    </Fragment>
  ));
}

/** Placeholder highlight wrapper (inert outside draft mode). */
export function Todo({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span data-todo={site.draftMode ? "" : undefined} className={className}>
      {children}
    </span>
  );
}

/** Renders a single Text value, highlighting it if it's still a placeholder. */
export function T({ v, className }: { v: Text; className?: string }) {
  if (typeof v === "string") return className ? <span className={className}>{withHonorifics(v)}</span> : <>{withHonorifics(v)}</>;
  return <Todo className={className}>{v.value}</Todo>;
}

/** Renders a sentence made of text + placeholders. */
export function RichText({ parts }: { parts: Rich }) {
  return (
    <>
      {parts.map((p, i) => (
        <T key={i} v={p} />
      ))}
    </>
  );
}

/** Wraps a number in the placeholder highlight if it's still a draft value. */
export function DraftNum({ n, children }: { n: Num; children: React.ReactNode }) {
  return n.draft ? <Todo>{children}</Todo> : <>{children}</>;
}
