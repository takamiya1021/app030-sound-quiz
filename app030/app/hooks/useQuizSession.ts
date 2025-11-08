'use client';

import { useCallback, useEffect, useMemo, useState } from "react";
import { resetQuizStore, useQuizStore } from "@/store/useQuizStore";
import { QUIZ_LENGTH, DifficultyLevel, isDifficultyLevel } from "@/types";

export type QuizStatus = "idle" | "loading" | "in-progress" | "completed" | "error";

const DEFAULT_CATEGORY = "楽器の音";
const DEFAULT_DIFFICULTY: DifficultyLevel = "beginner";

export function useQuizSession(category?: string | null, difficultyInput?: string | null) {
  const normalizedCategory = category ?? DEFAULT_CATEGORY;
  const normalizedDifficulty = useMemo<DifficultyLevel>(
    () => (isDifficultyLevel(difficultyInput) ? difficultyInput : DEFAULT_DIFFICULTY),
    [difficultyInput],
  );

  const [error, setError] = useState<string | null>(null);

  const currentSession = useQuizStore((state) => state.currentSession);
  const currentSound = useQuizStore((state) => state.currentSound);
  const currentChoices = useQuizStore((state) => state.currentChoices);
  const startQuiz = useQuizStore((state) => state.startQuiz);
  const answerQuestion = useQuizStore((state) => state.answerQuestion);
  const nextQuestion = useQuizStore((state) => state.nextQuestion);
  const finishQuiz = useQuizStore((state) => state.finishQuiz);
  const score = useQuizStore((state) => state.score);

  useEffect(() => {
    if (!normalizedCategory) {
      return;
    }

    if (
      currentSession &&
      currentSession.category === normalizedCategory &&
      currentSession.difficulty === normalizedDifficulty
    ) {
      return;
    }

    try {
      startQuiz(normalizedCategory, normalizedDifficulty);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("クイズの開始に失敗しました");
    }
  }, [normalizedCategory, normalizedDifficulty, currentSession, startQuiz]);

  const status: QuizStatus = useMemo(() => {
    if (error) return "error";
    if (!normalizedCategory) return "idle";
    if (!currentSession) return "loading";
    return currentSession.completedAt ? "completed" : "in-progress";
  }, [currentSession, normalizedCategory, error]);

  const questionNumber = currentSession ? currentSession.currentIndex + 1 : 0;

  const submitAnswer = useCallback(
    (choiceIndex: number) => {
      if (!currentSession || currentSession.completedAt) return;

      answerQuestion(choiceIndex);

      const isLastQuestion = currentSession.currentIndex >= QUIZ_LENGTH - 1;
      if (isLastQuestion) {
        finishQuiz();
      } else {
        nextQuestion();
      }
    },
    [currentSession, answerQuestion, nextQuestion, finishQuiz],
  );

  const resetQuiz = useCallback(() => {
    resetQuizStore();
    setError(null);
  }, []);

  return {
    status,
    error,
    session: currentSession,
    questionNumber,
    totalQuestions: QUIZ_LENGTH,
    sound: currentSound(),
    choices: currentChoices(),
    submitAnswer,
    score: score(),
    resetQuiz,
  };
}
