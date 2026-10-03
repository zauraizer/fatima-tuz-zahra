import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { gsap, useGSAP } from "../lib/gsap";

type Toast = { id: number; message: string };
const ToastContext = createContext<(message: string) => void>(() => {});
export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  const push = useCallback((message: string) => {
    const id = ++nextId.current;
    setToasts((all) => [...all.slice(-2), { id, message }]);
    window.setTimeout(() => setToasts((all) => all.filter((t) => t.id !== id)), 3200);
  }, []);

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-6 z-[95] flex flex-col items-center gap-2 px-4"
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} message={t.message} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ message }: { message: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    gsap.from(ref.current, { y: 24, autoAlpha: 0, scale: 0.94, duration: 0.6, ease: "back.out(1.7)" });
  });
  return (
    <div
      ref={ref}
      className="flex max-w-md items-center gap-3 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-cream shadow-lift"
    >
      <span className="size-2 shrink-0 rounded-full bg-gold shadow-[0_0_0_4px_rgb(200_147_58/0.3)]" />
      {message}
    </div>
  );
}
