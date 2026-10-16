"use client";

import { isCloudflareRuntime } from "@/lib/cfRuntime";

/** "Terms" and "Privacy Policy" links (cloudflare/terms.html, cloudflare/privacy.html), on the game's own site. */
export function LegalLinks({ prefix, className = "" }: { prefix?: string; className?: string }) {
  if (!isCloudflareRuntime()) return null;
  const link = "font-semibold text-[#2457e6] underline underline-offset-2";
  return (
    <p className={`text-center text-[11px] leading-snug text-muted ${className}`}>
      {prefix ? `${prefix} ` : ""}
      <a href="/terms" target="_blank" rel="noopener" className={link}>
        Terms of Use
      </a>{" "}
      and{" "}
      <a href="/privacy" target="_blank" rel="noopener" className={link}>
        Privacy Policy
      </a>
      .
    </p>
  );
}
