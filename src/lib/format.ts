const usd0 = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const usd2 = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 });
const num = new Intl.NumberFormat("en-US");

/** $1,250 — or $1,250.40 when there are cents. */
export const usd = (n: number) => (Number.isInteger(n) ? usd0 : usd2).format(n);
export const usdWhole = (n: number) => usd0.format(Math.round(n));
export const formatNumber = (n: number) => num.format(Math.round(n));
