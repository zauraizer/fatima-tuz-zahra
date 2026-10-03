import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/lora";
import "@fontsource-variable/lora/wght-italic.css";
import "@fontsource-variable/plus-jakarta-sans";
import "@fontsource/amiri/arabic-400.css";
import "./index.css";
import App from "./App";
import { site } from "./content";

if (site.draftMode) document.documentElement.setAttribute("data-draft", "");

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
