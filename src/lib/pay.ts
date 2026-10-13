/**
 * Paying for a poster online with Paystack (the Cloudflare build, once the owner
 * has set PAYSTACK_SECRET_KEY on the Worker). The Worker works out the price,
 * starts the checkout and checks the payment with Paystack; the page only
 * sends the advertiser there and back. See worker/index.ts › Paystack.
 */

import { adminCall, apiCall, isCloudflareRuntime } from "./cfRuntime";

let enabled: Promise<boolean> | null = null;

/** Can advertisers pay online here? */
export function payEnabled(): Promise<boolean> {
  if (!isCloudflareRuntime()) return Promise.resolve(false);
  enabled ??= fetch("/api/health")
    .then((r) => r.json() as Promise<{ pay?: boolean }>)
    .then((h) => !!h.pay)
    .catch(() => {
      enabled = null;
      return false;
    });
  return enabled;
}

export type PayError = "need_email" | "already_paid" | "not_pending" | "closed" | "rate_limited" | "failed";

/** Start the checkout for one of my submissions; resolves the Paystack page to open. */
export async function startPayment(subId: string, huntCase: string | undefined, email?: string): Promise<{ url: string; amount: number } | { error: PayError }> {
  try {
    const r = (await apiCall("/api/pay/start", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ subId, huntCase, email }) })) as { url: string; amount: number };
    return r;
  } catch (e) {
    const code = (e as { code?: string }).code ?? "";
    return { error: (["need_email", "already_paid", "not_pending", "closed", "rate_limited"].includes(code) ? code : "failed") as PayError };
  }
}

export const PAY_MESSAGES: Record<PayError, string> = {
  need_email: "Paystack needs an email for your receipt.",
  already_paid: "This poster is already paid for.",
  not_pending: "This poster isn't waiting for payment any more.",
  closed: "Advertising is paused for now.",
  rate_limited: "Too many tries. Please wait a little and try again.",
  failed: "Couldn't open Paystack just now. Please try again.",
};

/** After coming back from Paystack: did it go through? */
export async function verifyPayment(ref: string): Promise<"paid" | "pending" | "failed"> {
  try {
    const r = (await apiCall("/api/pay/verify", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ref }) })) as { status: string };
    return r.status === "paid" ? "paid" : r.status === "failed" || r.status === "abandoned" || r.status === "reversed" || r.status === "mismatch" ? "failed" : "pending";
  } catch {
    return "pending";
  }
}

/** My submissions that are paid for: id -> amount. */
export async function myPayments(): Promise<Record<string, number>> {
  if (!isCloudflareRuntime()) return {};
  try {
    const r = (await apiCall("/api/pay/mine")) as { paid: { sub_id: string; amount: number }[] };
    return Object.fromEntries(r.paid.map((p) => [p.sub_id, p.amount]));
  } catch {
    return {};
  }
}

export interface OwnerPayment {
  ref: string;
  uid: string;
  sub_id: string;
  amount: number;
  status: "paid" | "mismatch";
  paid_at: number | null;
  channel: string | null;
}

/** Owner: payments that came in (by submission id), and whether Paystack is set up. */
export async function ownerPayments(): Promise<{ enabled: boolean; bySub: Record<string, OwnerPayment> }> {
  if (!isCloudflareRuntime()) return { enabled: false, bySub: {} };
  try {
    const r = (await adminCall("payments")) as { enabled: boolean; payments: OwnerPayment[] };
    const bySub: Record<string, OwnerPayment> = {};
    // a paid one wins over a mismatched try for the same poster
    for (const p of r.payments) if (!bySub[`${p.uid}/${p.sub_id}`] || p.status === "paid") bySub[`${p.uid}/${p.sub_id}`] = p;
    return { enabled: r.enabled, bySub };
  } catch {
    return { enabled: false, bySub: {} };
  }
}

/** The Paystack reference when the page opens on the way back from checkout (and tidy the address). */
export function returningFromPaystack(): { ref: string | null; cancelled: boolean } {
  if (typeof window === "undefined" || !isCloudflareRuntime()) return { ref: null, cancelled: false };
  const q = new URLSearchParams(window.location.search);
  const paid = q.get("paid");
  if (paid === null) return { ref: null, cancelled: false };
  const ref = q.get("reference") ?? q.get("trxref");
  window.history.replaceState(null, "", window.location.pathname + window.location.hash);
  return { ref: ref && /^ND-[A-Za-z0-9-]{1,40}$/.test(ref) ? ref : null, cancelled: paid === "0" };
}
