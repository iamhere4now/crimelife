/** Naira, in full: ₦350,000 */
export function money(n: number): string {
  const s = `₦${Math.abs(Math.round(n)).toLocaleString("en-US")}`;
  return n < 0 ? `-${s}` : s;
}

/** Naira, compact for tight spots: ₦350k, ₦1.2M */
export function moneyShort(n: number): string {
  const a = Math.abs(n);
  const s =
    a >= 1_000_000
      ? `₦${(a / 1_000_000).toFixed(a >= 10_000_000 ? 0 : 1).replace(/\.0$/, "")}M`
      : a >= 1000
        ? `₦${Math.round(a / 1000)}k`
        : `₦${Math.round(a)}`;
  return n < 0 ? `-${s}` : s;
}

export function compact(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return String(n);
}
