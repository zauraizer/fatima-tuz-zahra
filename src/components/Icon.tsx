import type { ComponentPropsWithoutRef } from "react";

const GLYPHS = {
  home: "house",
  school: "graduation-cap",
  health: "first-aid-kit",
  book: "book-open-text",
  ball: "soccer-ball",
  tools: "toolbox",
  lock: "lock-key",
  receipt: "receipt",
  heart: "heart",
  arrow: "arrow-right",
  arrowUp: "arrow-up",
  check: "check",
  copy: "copy-simple",
  phone: "phone",
  mail: "envelope-simple",
  pin: "map-pin",
  clock: "clock",
  map: "map-trifold",
  camera: "camera",
  plus: "plus",
  pause: "pause",
  play: "play",
  chevronDown: "caret-down",
  users: "users-three",
  meal: "fork-knife",
  flag: "flag-pennant",
  briefcase: "briefcase",
  share: "share-network",
  bank: "bank",
  envelope: "envelope-open",
  cart: "shopping-cart",
  zap: "lightning",
  instagram: "instagram-logo",
  facebook: "facebook-logo",
  youtube: "youtube-logo",
} as const;

export type IconName = keyof typeof GLYPHS;

const FONT_SIZE_CLASSES: Record<string, string> = {
  "3.5": "[font-size:0.875rem]",
  "4": "[font-size:1rem]",
  "4.5": "[font-size:1.125rem]",
  "5": "[font-size:1.25rem]",
  "5.5": "[font-size:1.375rem]",
  "6": "[font-size:1.5rem]",
  "7": "[font-size:1.75rem]",
  "8": "[font-size:2rem]",
  "9": "[font-size:2.25rem]",
  "12": "[font-size:3rem]",
};

function fontSizeClasses(className: string) {
  return className
    .split(/\s+/)
    .flatMap((token) => {
      const match = token.match(/^((?:[a-z]+:)*)size-(\d+(?:\.\d+)?)$/);
      if (!match) return [];
      const sizeClass = FONT_SIZE_CLASSES[match[2]];
      return sizeClass ? [`${match[1]}${sizeClass}`] : [];
    })
    .join(" ");
}

type IconProps = Omit<ComponentPropsWithoutRef<"i">, "aria-hidden"> & { name: IconName };

/** Project icon vocabulary, rendered with the locally bundled Phosphor regular webfont. */
export function Icon({ name, className = "size-6", ...props }: IconProps) {
  return (
    <i
      {...props}
      className={`ph ph-${GLYPHS[name]} inline-flex shrink-0 items-center justify-center leading-none ${fontSizeClasses(className)} ${className}`}
      aria-hidden="true"
    />
  );
}
