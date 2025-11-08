'use client';

interface QuizResultCardProps {
  correct: number;
  total: number;
  percentage: number;
  onRetry?: () => void;
  onBack?: () => void;
}

export function QuizResultCard({
  correct,
  total,
  percentage,
  onRetry,
  onBack,
}: QuizResultCardProps) {
  return (
    <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/70 via-indigo-900/30 to-violet-900/30 p-8 text-center shadow-[0_20px_50px_rgba(15,23,42,0.45)]">
      <p className="text-sm uppercase tracking-[0.4em] text-indigo-200/70">
        RESULT
      </p>
      <h3 className="mt-4 text-4xl font-semibold text-white">{percentage.toFixed(1)}%</h3>
      <p className="mt-2 text-base text-slate-200">
        {total}問中 <span className="font-semibold text-white">{correct}</span> 問正解でした
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="rounded-full bg-indigo-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400"
          >
            もう一度挑戦
          </button>
        )}
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-slate-200 transition hover:border-indigo-300 hover:text-white"
          >
            ホームに戻る
          </button>
        )}
      </div>
    </section>
  );
}
