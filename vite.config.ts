import { readFileSync } from "node:fs";
import { defineConfig, type HtmlTagDescriptor, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self' data:",
  "connect-src 'self' https:",
  "frame-src https:",
  "form-action 'self' https: mailto:",
  "base-uri 'self'",
  "object-src 'none'",
].join("; ");

/*
  Launch guard (production builds only). Reads src/content.ts so that nothing
  unfinished reaches the public by accident:
  - While draftMode is true, every page carries a "noindex" tag, so a draft
    build that gets deployed somewhere is kept out of search results.
  - With draftMode false, the build fails if any placeholder is still left,
    because those would otherwise show to visitors without the highlight.
*/
function launchGuard(): Plugin {
  const read = () => {
    const src = readFileSync(new URL("./src/content.ts", import.meta.url), "utf8").replace(/\/\*[\s\S]*?\*\/|(?<!:)\/\/.*$/gm, "");
    const draftMode = !/draftMode:\s*false/.test(src);
    const left = (src.match(/\bdraft\(\s*["'`]|\bdraft:\s*true/g) ?? []).length;
    return { draftMode, left };
  };
  return {
    name: "launch-guard",
    apply: "build",
    buildStart() {
      const { draftMode, left } = read();
      if (!draftMode && left > 0) {
        this.error(`src/content.ts still has ${left} placeholder(s). Fill them in, or set draftMode back to true.`);
      }
      if (draftMode) this.warn("Building a DRAFT site: placeholders are highlighted and search engines are told not to index it.");
    },
    transformIndexHtml() {
      // Only the site's own scripts may run. Forms may post to an https service
      // (e.g. Formspree) and a map may be embedded. (Not in dev: the dev server
      // needs inline scripts for hot reload.)
      const tags: HtmlTagDescriptor[] = [{ tag: "meta", attrs: { "http-equiv": "Content-Security-Policy", content: CSP }, injectTo: "head-prepend" }];
      if (read().draftMode) tags.push({ tag: "meta", attrs: { name: "robots", content: "noindex, nofollow" }, injectTo: "head" });
      return tags;
    },
  };
}

export default defineConfig({
  plugins: [launchGuard(), react(), tailwindcss()],
  server: { port: 5190, strictPort: true },
  build: { sourcemap: false },
});
