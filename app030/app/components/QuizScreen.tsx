'use client';

import { useMemo } from "react";
import Link from "next/link";

import { AudioPlayer } from "@/app/components/AudioPlayer";
import { QuizChoices } from "@/app/components/QuizChoices";
import { QuizHeading } from "@/app/components/QuizHeading";
import { QuizResultCard } from "@/app/components/QuizResultCard";
import { ConfusedPairsPanel } from "@/app/components/ConfusedPairsPanel";
import { AIListeningTips } from "@/app/components/AIListeningTips";
import { AIStudyPlan } from "@/app/components/AIStudyPlan";
import { useQuizSession } from "@/app/hooks/useQuizSession";
import { useQuizStore } from "@/store/useQuizStore";
import sounds from "@/data/sounds";

interface QuizScreenProps {
  category?: string | null;
  difficulty?: string | null;
}

export function QuizScreen({ category, difficulty }: QuizScreenProps) {
  const {
    status,
    error,
    session,
    questionNumber,
    totalQuestions,
    sound,
    choices,
    submitAnswer,
    score,
    resetQuiz,
  } = useQuizSession(category, difficulty);

  const confusedPairs = useQuizStore((state) => state.progress.confusedPairs);
  const topPair = confusedPairs[0];
  const soundMap = useSoundMap();
  const tipSoundA = topPair ? soundMap.get(topPair.sound1) ?? null : null;
  const tipSoundB = topPair ? soundMap.get(topPair.sound2) ?? null : null;

  if (status === "error") {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-4xl flex-col items-center justify-center gap-4 px-4 text-center text-slate-200">
        <p className="text-xl font-semibold text-white">クイズの開始に失敗しました</p>
        <p className="text-sm text-slate-400">{error}</p>
        <button
          type="button"
          onClick={resetQuiz}
          className="rounded-full bg-indigo-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400"
        >
          再読み込み
        </button>
      </div>
    );
  }

  if (status === "completed") {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
        <QuizResultCard
          correct={score.correct}
          total={score.total}
          percentage={score.percentage}
          onRetry={resetQuiz}
        />
        <ConfusedPairsPanel />
        <AIListeningTips soundA={tipSoundA} soundB={tipSoundB} />
        <AIStudyPlan />
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-slate-200 transition hover:border-indigo-300 hover:text-white"
        >
          ホームに戻る
        </Link>
      </div>
    );
  }

  if (status === "loading" || !session) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-4xl flex-col items-center justify-center gap-4 px-4 text-center text-slate-200">
        <span className="text-sm uppercase tracking-[0.4em] text-slate-400">
          Loading
        </span>
        <p className="text-2xl font-semibold text-white">音声を準備中です...</p>
      </div>
    );
  }

  const currentSound = sound ?? session.sounds[session.currentIndex];
  const currentChoices = choices ?? session.choices[session.currentIndex] ?? [];

  const selectedIndex = session.answers[session.currentIndex] ?? null;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <QuizHeading
        questionNumber={questionNumber}
        totalQuestions={totalQuestions}
        category={session.category}
        difficulty={session.difficulty}
      />

      <AudioPlayer
        key={`${session.id}-${session.currentIndex}`}
        soundName={currentSound?.name ?? "音源"}
        filename={currentSound?.filename ?? ""}
        maxPlayCount={3}
      />

      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
        {currentChoices.length > 0 ? (
          <QuizChoices
            choices={currentChoices}
            selectedIndex={selectedIndex}
            disabled={selectedIndex !== null}
            onSelect={submitAnswer}
          />
        ) : (
          <p className="text-sm text-slate-300">選択肢を準備しています...</p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
        <span className="rounded-full border border-white/10 px-3 py-1">
          正答率 {score.percentage.toFixed(1)}%
        </span>
        <span className="rounded-full border border-white/10 px-3 py-1">
          正解 {score.correct} / {score.total}
        </span>
        <Link
          href="/"
          className="ml-auto text-indigo-200 underline-offset-4 hover:underline"
        >
          ホームに戻る
        </Link>
      </div>
    </div>
  );
}

function useSoundMap() {
  return useMemo(() => {
    const map = new Map<string, (typeof sounds)[number]>();
    sounds.forEach((sound) => map.set(sound.id, sound));
    return map;
  }, []);
}
