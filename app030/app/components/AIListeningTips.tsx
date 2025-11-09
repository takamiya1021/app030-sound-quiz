'use client';

import { useState } from "react";

import { geminiService } from "@/lib/geminiService";
import { SoundData } from "@/types";

interface AIListeningTipsProps {
  soundA: SoundData | null;
  soundB: SoundData | null;
}

export function AIListeningTips({ soundA, soundB }: AIListeningTipsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tips, setTips] = useState<{ differences: string[]; focusPoints: string[]; tips: string[] } | null>(null);

  const canGenerate = Boolean(soundA && soundB);

  const handleGenerate = async () => {
    if (!soundA || !soundB) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await geminiService.generateListeningTips(soundA, soundB);
      setTips(response);
    } catch {
      setError("AIアドバイスの生成に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="rounded-3xl border border-white/10 bg-slate-950/30 p-6 text-white">
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">AI LISTENING COACH</p>
          <h3 className="text-lg font-semibold">聞き分けヒント</h3>
        </div>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={!canGenerate || isLoading}
          className="rounded-full bg-purple-500 px-4 py-1 text-xs font-semibold text-white transition hover:bg-purple-400 disabled:opacity-60"
        >
          {isLoading ? "生成中..." : "ヒントを生成"}
        </button>
      </div>
      {!canGenerate && (
        <p className="mt-3 text-sm text-slate-400">比較する音がありません。まずはクイズで苦手な音を見つけてください。</p>
      )}
      {error && <p className="mt-3 text-sm text-rose-300">{error}</p>}
      {tips && (
        <div className="mt-4 grid gap-4 text-sm text-slate-200">
          <div>
            <p className="font-semibold text-white">違いのポイント</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {tips.differences.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-semibold text-white">注目ポイント</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {tips.focusPoints.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-semibold text-white">練習のコツ</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {tips.tips.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}
