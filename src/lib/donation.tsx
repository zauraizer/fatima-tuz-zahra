import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { give, type Designation } from "../content";

/*
  Shared donation state. The donate widget renders it; the sponsorship
  section pre-fills it and brings the widget into view.
*/

export type Frequency = "monthly" | "once";
export type DonationState = { frequency: Frequency; amount: number; designation: Designation };

type DonationContextValue = DonationState & {
  update: (patch: Partial<DonationState>) => void;
  /** Pre-fill the widget, scroll to it, and make it pulse. */
  prefill: (patch: Partial<DonationState>) => void;
  /** Increments on every prefill so the widget can play its highlight. */
  pulse: number;
};

const DonationContext = createContext<DonationContextValue | null>(null);

export function useDonation() {
  const ctx = useContext(DonationContext);
  if (!ctx) throw new Error("useDonation must be used inside <DonationProvider>");
  return ctx;
}

export function DonationProvider({ children, onPrefill }: { children: ReactNode; onPrefill: () => void }) {
  const [state, setState] = useState<DonationState>({
    frequency: "monthly",
    amount: give.defaultAmount,
    designation: "General",
  });
  const [pulse, setPulse] = useState(0);

  const update = useCallback((patch: Partial<DonationState>) => setState((s) => ({ ...s, ...patch })), []);
  const prefill = useCallback(
    (patch: Partial<DonationState>) => {
      update(patch);
      setPulse((p) => p + 1);
      onPrefill();
    },
    [update, onPrefill],
  );

  const value = useMemo(() => ({ ...state, update, prefill, pulse }), [state, update, prefill, pulse]);
  return <DonationContext.Provider value={value}>{children}</DonationContext.Provider>;
}
