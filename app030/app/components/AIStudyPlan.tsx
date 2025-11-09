'use client';

import { useState } from "react";

import { geminiService } from "@/lib/geminiService";
import { useQuizStore } from "@/store/useQuizStore";

export function AIStudyPlan() {
  const progress = useQuizStore((state) => state.progress);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<{
    weakCategories: string[];
    recommendedOrder: string[];
    practiceSchedule: string[];
  } | null>(null);

  const hasHistory = Object.keys(progress.categoryStats).length > 0;

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await geminiService.suggestStudyPlan(progress);
      setPlan(result);
    } catch {
      setError("学習プランの生成に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white">
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">AI STUDY COACH</p>
          <h3 className="text-lg font-semibold">パーソナル学習プラン</h3>
        </div>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={isLoading || !hasHistory}
          className="rounded-full bg-emerald-500 px-4 py-1 text-xs font-semibold text-white transition hover:bg-emerald-400 disabled:opacity-60"
        >
          {isLoading ? "生成中..." : "プランを生成"}
        </button>
      </div>
      {!hasHistory && (
        <p className="mt-3 text-sm text-slate-300">
          まずはクイズに挑戦して学習履歴を作成してください。履歴を元に最適な学習順序を提案します。
        </p>
      )}
      {error && <p className="mt-3 text-sm text-rose-300">{error}</p>}
      {plan && (
        <div className="mt-4 grid gap-4 text-sm text-slate-200">
          <div>
            <p className="font-semibold text-white">苦手カテゴリー</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {plan.weakCategories.map((cat) => (
                <li key={cat}>{cat}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-semibold text-white">推奨学習順序</p>
            <ol className="mt-2 list-decimal space-y-1 pl-5">
              {plan.recommendedOrder.map((cat) => (
                <li key={cat}>{cat}</li>
              ))}
            </ol>
          </div>
          <div>
            <p className="font-semibold text-white">練習スケジュール</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {plan.practiceSchedule.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}
