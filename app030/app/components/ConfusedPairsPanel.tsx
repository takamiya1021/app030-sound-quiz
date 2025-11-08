'use client';

import Link from "next/link";

import { useQuizStore } from "@/store/useQuizStore";
import { SoundData } from "@/types";
import sounds from "@/data/sounds";

const soundMap = new Map<string, SoundData>();
sounds.forEach((sound) => soundMap.set(sound.id, sound));

export function ConfusedPairsPanel() {
  const confusedPairs = useQuizStore((state) => state.progress.confusedPairs);

  if (!confusedPairs.length) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-300">
        まだ間違えやすい組み合わせはありません。クイズで苦手な音を見つけたらここに表示されます。
      </div>
    );
  }

  const topPairs = confusedPairs.slice(0, 5);

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">CONFUSED PAIRS</p>
          <h3 className="mt-2 text-lg font-semibold">よく間違える音の組み合わせ</h3>
        </div>
        <Link
          href="/library"
          className="text-sm text-indigo-200 underline-offset-4 hover:underline"
        >
          ライブラリで復習
        </Link>
      </div>

      <div className="mt-4 flex flex-col divide-y divide-white/10 text-sm">
        {topPairs.map((pair) => {
          const soundA = soundMap.get(pair.sound1);
          const soundB = soundMap.get(pair.sound2);

          return (
            <div key={`${pair.sound1}-${pair.sound2}`} className="flex items-center gap-4 py-3">
              <div className="flex flex-1 flex-col gap-1">
                <p className="text-slate-200">
                  {soundA?.name ?? pair.sound1}
                  <span className="mx-2 text-slate-500">vs</span>
                  {soundB?.name ?? pair.sound2}
                </p>
                <p className="text-xs text-slate-400">
                  {soundA?.category ?? "不明"} / {soundB?.category ?? "不明"}
                </p>
              </div>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-200">
                {pair.count}回ミス
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
