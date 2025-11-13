'use client';

import Link from "next/link";
import { useMemo, useState } from "react";

import { AudioPlayer } from "@/app/components/AudioPlayer";
import { CategorySelector, type CategoryInfo } from "@/app/components/CategorySelector";
import sounds from "@/data/sounds";
import { SoundData } from "@/types";

type AudioEngineLike = {
  playSound: (filename: string) => Promise<void>;
  stopSound: () => void;
};

interface HomeProps {
  previewEngine?: AudioEngineLike;
}

const CATEGORY_DETAILS: Record<
  string,
  {
    description: string;
    icon: string;
  }
> = {
  楽器の音: {
    description: "弦・鍵盤・管楽器の音色を聞き分けて音感を磨く",
    icon: "🎹",
  },
  動物の鳴き声: {
    description: "似た鳴き声のニュアンスを捉えて瞬時に判別",
    icon: "🐾",
  },
  日常の音: {
    description: "暮らしの中の音に意識を向け直感力を鍛える",
    icon: "🏠",
  },
  自然の音: {
    description: "自然環境の音を通して空気感を学ぶ",
    icon: "🌿",
  },
  効果音: {
    description: "クリエイティブ制作に役立つ効果音を暗記",
    icon: "✨",
  },
};

const HERO_STATS = [
  { label: "1セット", value: "10問" },
  { label: "音源数", value: "50+" },
  { label: "難易度", value: "3段階" },
];

export function Home({ previewEngine }: HomeProps) {
  const categories = useMemo<CategoryInfo[]>(() => {
    const map = new Map<string, { count: number; icon: string; description: string }>();

    sounds.forEach((sound) => {
      if (!map.has(sound.category)) {
        const meta = CATEGORY_DETAILS[sound.category] ?? {
          description: "耳を澄まして微細な違いをキャッチ",
          icon: "🎧",
        };
        map.set(sound.category, { count: 0, ...meta });
      }
      map.get(sound.category)!.count += 1;
    });

    return Array.from(map.entries()).map(([category, meta]) => ({
      id: category,
      label: category,
      description: meta.description,
      icon: meta.icon,
      totalSounds: meta.count,
    }));
  }, []);

  const [selectedCategory, setSelectedCategory] = useState(
    categories[0]?.id ?? "",
  );

  const previewSound: SoundData | undefined = useMemo(() => {
    if (!selectedCategory) return sounds[0];
    return sounds.find((sound) => sound.category === selectedCategory) ?? sounds[0];
  }, [selectedCategory]);

  const canStart = Boolean(selectedCategory);
  const quizHref = canStart
    ? `/quiz?category=${encodeURIComponent(selectedCategory)}&difficulty=beginner`
    : "#";

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-12 sm:px-6 lg:px-8">
      {/* Settings Link */}
      <div className="flex justify-end">
        <Link
          href="/settings"
          className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-slate-900/40 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-indigo-300 hover:bg-slate-900/60 hover:text-white"
          title="設定"
        >
          <span className="text-lg">⚙️</span>
          <span>設定</span>
        </Link>
      </div>

      <section className="grid gap-6 lg:grid-cols-[3fr,2fr]">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_20px_60px_rgba(15,23,42,0.4)] backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.4em] text-indigo-200/80">
            LISTEN & LEARN
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight text-white sm:text-5xl">
            音当てクイズで
            <br />
            耳の解像度を高めよう
          </h1>
          <p className="mt-6 text-lg text-slate-200">
            日常音から楽器、動物の鳴き声まで。ランダムに再生される音を当てながら、
            遊ぶように音感トレーニングができます。
          </p>

          <ul className="mt-8 grid gap-3 text-sm text-slate-200 sm:grid-cols-2">
            <li className="flex items-start gap-3">
              <span className="text-lg">🎧</span>
              音源を繰り返し聞いて特徴を掴む練習
            </li>
            <li className="flex items-start gap-3">
              <span className="text-lg">📈</span>
              カテゴリー別の正答率をトラッキング
            </li>
            <li className="flex items-start gap-3">
              <span className="text-lg">🧠</span>
              Gemini AI が苦手音を解説
            </li>
            <li className="flex items-start gap-3">
              <span className="text-lg">⏱</span>
              タイムアタックで集中力を鍛える
            </li>
          </ul>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href={quizHref}
              aria-disabled={!canStart}
              className={[
                "inline-flex items-center justify-center rounded-full px-6 py-3 text-base font-semibold transition",
                canStart
                  ? "bg-indigo-500 text-white shadow-[0_15px_35px_rgba(99,102,241,0.45)] hover:bg-indigo-400"
                  : "pointer-events-none bg-slate-700 text-slate-400",
              ].join(" ")}
            >
              クイズを始める
              <span className="ml-2 text-lg">→</span>
            </Link>
            <a
              href="#categories"
              className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3 text-base font-semibold text-slate-200 transition hover:border-indigo-300 hover:text-white"
            >
              カテゴリーを見る
            </a>
          </div>
        </div>

        <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-slate-950/30 p-6 shadow-[0_20px_40px_rgba(2,6,23,0.5)]">
          <div className="grid grid-cols-3 gap-3">
            {HERO_STATS.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 text-center"
              >
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  {stat.label}
                </p>
                <p className="mt-2 text-xl font-semibold text-white">{stat.value}</p>
              </div>
            ))}
          </div>
          {previewSound && (
            <AudioPlayer
              soundName={previewSound.name}
              filename={previewSound.filename}
              maxPlayCount={3}
              engine={previewEngine}
            />
          )}
          <div className="rounded-2xl border border-white/5 bg-slate-900/60 p-4 text-sm text-slate-300">
            「音感をゲーム感覚で伸ばしたい」「子どもの聴覚教育に使いたい」など、
            目的別のプランも順次追加予定です。
          </div>
        </div>
      </section>

      <div id="categories">
        <CategorySelector
          categories={categories}
          selectedId={selectedCategory}
          onSelect={setSelectedCategory}
        />
      </div>
    </div>
  );
}
