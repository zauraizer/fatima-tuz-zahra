import { useId, useState, type ReactNode } from "react";
import { Icon, type IconName } from "./Icon";

/** Accordion row. Height animates with the grid-rows 0fr → 1fr trick, so content never needs measuring. */
export function Collapsible({
  title,
  icon,
  children,
  defaultOpen = false,
  size = "md",
}: {
  title: ReactNode;
  icon?: IconName;
  children: ReactNode;
  defaultOpen?: boolean;
  size?: "md" | "lg";
}) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  const panelId = `panel${id.replace(/:/g, "")}`;

  return (
    <div className="border-b border-line">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
        data-pop="1.012"
        data-pop-lift="0"
        className={`group flex w-full items-center gap-4 text-left ${size === "lg" ? "py-6" : "py-5"}`}
      >
        {icon && (
          <span data-pop-icon className="grid size-11 shrink-0 place-items-center rounded-xl border border-line bg-cream text-forest transition-colors duration-300 group-hover:border-forest">
            <Icon name={icon} className="size-5" />
          </span>
        )}
        <span className={`flex-1 font-display font-semibold ${size === "lg" ? "text-xl md:text-[1.4rem]" : "text-lg"}`}>{title}</span>
        <span
          className={`grid size-9 shrink-0 place-items-center rounded-full border transition-all duration-500 ease-out-expo ${
            open ? "rotate-[135deg] border-forest bg-forest text-white" : "border-line text-forest group-hover:border-forest"
          }`}
        >
          <Icon name="plus" className="size-4" strokeWidth={2.2} />
        </span>
      </button>
      <div
        id={panelId}
        data-collapsible={open ? "open" : "closed"}
        inert={!open}
        className={`grid transition-[grid-template-rows,opacity] duration-500 ease-out-expo ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
      >
        <div className="overflow-hidden">
          <div className={size === "lg" ? "pr-14 pb-7" : "pb-6"}>{children}</div>
        </div>
      </div>
    </div>
  );
}
