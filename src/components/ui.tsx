import { Eye } from "lucide-react";
import { compact } from "@/lib/format";

export function BrandMark({ className = "size-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-label="Naija Detective">
      <path d="M32 6l22 7.5v16.5c0 14-9.4 24-22 28.5C19.4 54 10 44 10 30V13.5z" fill="#14161B" />
      <path d="M32 18l4 8.2 9 1.3-6.5 6.3 1.5 9L32 38.6l-8 4.2 1.5-9-6.5-6.3 9-1.3z" fill="#53FC18" />
    </svg>
  );
}

export function LiveBadge({ label = "LIVE", className = "" }: { label?: string; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-extrabold tracking-wide text-fg backdrop-blur ${className}`}
    >
      <span className="live-dot size-1.5 rounded-full bg-danger" />
      {label}
    </span>
  );
}

export function Tag({ children, active }: { children: React.ReactNode; active?: boolean }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${
        active ? "bg-kick text-ink" : "bg-raise text-neutral-600"
      }`}
    >
      {children}
    </span>
  );
}

export function Watching({ n, label = "inspecting" }: { n: number; label?: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-black/45 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur">
      <Eye className="size-3" />
      {compact(n)} {label}
    </span>
  );
}

export function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <div className="flex items-baseline justify-between px-5 pb-3 pt-7">
      <h2 className="text-lg font-bold tracking-tight">{title}</h2>
      {action && (
        <button onClick={onAction} className="text-sm font-medium text-muted transition hover:text-fg active:scale-95">
          {action}
        </button>
      )}
    </div>
  );
}

export function Stars({ rating, className = "size-3.5" }: { rating: number; className?: string }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${rating.toFixed(1)} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = Math.max(0, Math.min(1, rating - (i - 1)));
        return (
          <svg key={i} viewBox="0 0 24 24" className={className}>
            <defs>
              <linearGradient id={`star-${i}-${Math.round(fill * 10)}`}>
                <stop offset={fill} stopColor="#F5A524" />
                <stop offset={fill} stopColor="#E3E6EA" />
              </linearGradient>
            </defs>
            <path
              d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7L12 17.3 5.8 21l1.6-7L2 9.2l7.1-.6z"
              fill={`url(#star-${i}-${Math.round(fill * 10)})`}
            />
          </svg>
        );
      })}
    </span>
  );
}
