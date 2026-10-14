import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@phosphor-icons/web/regular";
import "@fontsource-variable/lora";
import "@fontsource-variable/plus-jakarta-sans";
import "@fontsource/amiri/arabic-400.css";
import "../index.css";
import { NotFound } from "./NotFound";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <NotFound />
  </StrictMode>,
);
