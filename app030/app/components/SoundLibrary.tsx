'use client';

import { useMemo, useState } from "react";

import { AudioPlayer } from "@/app/components/AudioPlayer";
import { useSoundLibrary } from "@/app/hooks/useSoundLibrary";
import { SoundData } from "@/types";

interface SoundLibraryProps {
  initialCategory?: string;
}

export function SoundLibrary({ initialCategory }: SoundLibraryProps) {
  const {
    categories,
    activeCategory,
    setActiveCategory,
    searchTerm,
    setSearchTerm,
    sounds,
  } = useSoundLibrary(initialCategory);

  const [preview, setPreview] = useState<SoundData | null>(null);

  const groupedSounds = useMemo(() => {
    return sounds.reduce<Record<string, SoundData[]>>((acc, sound) => {
      const difficulty = sound.difficulty;
      if (!acc[difficulty]) {
        acc[difficulty] = [];
      }
      acc[difficulty].push(sound);
      return acc;
    }, {});
  }, [sounds]);

  const difficultiesOrder = ["beginner", "intermediate", "advanced"];
  const difficultyLabel: Record<string, string> = {
    beginner: "初級",
    intermediate: "中級",
    advanced: "上級",
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="flex flex-wrap items-center gap-3">
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => setActiveCategory(category.id)}
              className={[
                "flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition",
                activeCategory === category.id
                  ? "border-indigo-400 bg-indigo-400/20 text-white"
                  : "border-white/10 bg-white/0 text-slate-200 hover:border-indigo-300/60",
              ].join(" ")}
            >
              <span>{category.icon}</span>
              {category.label}
              <span className="text-xs text-slate-400">({category.count})</span>
            </button>
          ))}
        </div>

        <div className="mt-6">
          <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
            キーワード検索
          </label>
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="音の名前や説明文で検索"
            className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
          />
        </div>
      </div>

      {preview && (
        <AudioPlayer
          soundName={preview.name}
          filename={preview.filename}
          maxPlayCount={3}
        />
      )}

      <div className="flex flex-col gap-6">
        {difficultiesOrder.map((difficulty) => {
          const sectionSounds = groupedSounds[difficulty] ?? [];
          if (sectionSounds.length === 0) {
            return null;
          }

          return (
            <section key={difficulty} className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">
                  {difficultyLabel[difficulty]} ({sectionSounds.length})
                </h3>
              </div>
              <div className="mt-4 divide-y divide-white/5">
                {sectionSounds.map((sound) => (
                  <button
                    key={sound.id}
                    type="button"
                    onClick={() => setPreview(sound)}
                    className={[
                      "flex w-full items-center gap-4 py-4 text-left transition",
                      preview?.id === sound.id ? "text-white" : "text-slate-200",
                    ].join(" ")}
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900/60 text-lg">
                      🔊
                    </div>
                    <div className="flex-1">
                      <p className="text-base font-semibold">{sound.name}</p>
                      <p className="text-sm text-slate-400">{sound.description}</p>
                    </div>
                    <span className="text-xs text-slate-400">{sound.category}</span>
                  </button>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
