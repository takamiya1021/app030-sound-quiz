'use client';

import { useId } from "react";

export interface CategoryInfo {
  id: string;
  label: string;
  description: string;
  icon: string;
  totalSounds: number;
}

interface CategorySelectorProps {
  categories: CategoryInfo[];
  selectedId?: string;
  onSelect?: (id: string) => void;
}

export function CategorySelector({
  categories,
  selectedId,
  onSelect,
}: CategorySelectorProps) {
  const headingId = useId();

  if (categories.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby={headingId} className="w-full">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p id={headingId} className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">
            カテゴリー
          </p>
          <p className="mt-1 text-base text-slate-300">
            練習したいジャンルを選択してください
          </p>
        </div>
        <span className="rounded-full bg-white/10 px-4 py-1 text-xs font-medium text-slate-200">
          {categories.length} 種類
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {categories.map((category) => {
          const isSelected = category.id === selectedId;
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => onSelect?.(category.id)}
              className={[
                "group flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition duration-200",
                isSelected
                  ? "border-indigo-400/60 bg-indigo-500/10 shadow-[0_0_25px_rgba(99,102,241,0.35)]"
                  : "hover:border-indigo-400/40 hover:bg-white/10",
              ].join(" ")}
              aria-pressed={isSelected}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{category.icon}</span>
                <div>
                  <p className="text-base font-semibold text-white">
                    {category.label}
                  </p>
                  <p className="text-xs text-slate-300">
                    {category.totalSounds} 音源
                  </p>
                </div>
              </div>
              <p className="text-sm text-slate-300">{category.description}</p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
