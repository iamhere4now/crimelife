"use client";

import { CASE_BY_ID, CATEGORIES } from "@/lib/cases";
import type { CategoryId } from "@/lib/types";
import { compact } from "@/lib/format";
import { SceneThumb } from "./scenes/SceneThumb";
import { Tag } from "./ui";

interface Props {
  active: CategoryId | null;
  onSelect: (id: CategoryId | null) => void;
  categories?: typeof CATEGORIES;
}

/** Kick-style category tiles: box art with a neon outline and a heavy wordmark. */
export function CategoryCarousel({ active, onSelect, categories = CATEGORIES }: Props) {
  return (
    <div className="no-scrollbar flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 pt-1">
      {categories.map((cat) => {
        const isActive = active === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => onSelect(isActive ? null : cat.id)}
            aria-pressed={isActive}
            className="w-[42%] max-w-[170px] shrink-0 snap-start text-left transition active:scale-95"
          >
            <div
              className={`relative aspect-[3/4] overflow-hidden rounded-xl bg-card ${
                isActive ? "neon-ring" : "ring-1 ring-kick/50"
              }`}
            >
              <SceneThumb theCase={CASE_BY_ID[cat.scene]} cast={false} className="absolute inset-0 size-full scale-125 opacity-80" />
              <div className="absolute inset-0 bg-gradient-to-t from-kick/70 via-kick/10 to-transparent mix-blend-hard-light" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <span className="wordmark absolute inset-x-2 bottom-3 text-center text-[28px] leading-none">{cat.wordmark}</span>
            </div>
            <div className="mt-2 truncate text-[15px] font-bold">{cat.name}</div>
            <div className="text-xs text-muted">{compact(cat.watching)} watching</div>
            <div className="mt-1.5 flex gap-1">
              {cat.tags.map((t) => (
                <Tag key={t}>{t}</Tag>
              ))}
            </div>
          </button>
        );
      })}
    </div>
  );
}
