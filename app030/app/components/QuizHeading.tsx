'use client';

interface QuizHeadingProps {
  questionNumber: number;
  totalQuestions: number;
  category: string;
  difficulty: string;
}

const difficultyLabel: Record<string, string> = {
  beginner: "初級",
  intermediate: "中級",
  advanced: "上級",
};

export function QuizHeading({
  questionNumber,
  totalQuestions,
  category,
  difficulty,
}: QuizHeadingProps) {
  const clampedQuestion = Math.min(Math.max(questionNumber, 0), totalQuestions);
  const progressRatio = totalQuestions > 0 ? clampedQuestion / totalQuestions : 0;
  const progressWidth = `${Math.min(100, Math.max(0, progressRatio * 100))}%`;

  return (
    <header className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
        <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-indigo-100">
          {difficultyLabel[difficulty] ?? difficulty}
        </span>
        <span className="rounded-full border border-white/15 px-3 py-1">
          {category}
        </span>
        <span className="text-white">
          Q{clampedQuestion} / {totalQuestions}
        </span>
      </div>
      <h2 className="mt-4 text-2xl font-semibold text-white">
        耳をすませて、どの音か当ててみましょう
      </h2>
      <div className="mt-4 h-2 rounded-full bg-slate-800/80">
        <div
          role="progressbar"
          aria-valuenow={clampedQuestion}
          aria-valuemin={0}
          aria-valuemax={totalQuestions}
          className="h-2 rounded-full bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500 transition-all"
          style={{ width: progressWidth }}
        />
      </div>
    </header>
  );
}
