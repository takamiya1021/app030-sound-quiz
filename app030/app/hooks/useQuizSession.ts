'use client';

import { startTransition, useCallback, useEffect, useMemo, useRef, useState } from "react";

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
  const scheduleErrorUpdate = useCallback((value: string | null) => {
    startTransition(() => {
      setError(value);
    });
  }, []);

  const currentSession = useQuizStore((state) => state.currentSession);
  const currentSound = useQuizStore((state) => state.currentSound);
  const currentChoices = useQuizStore((state) => state.currentChoices);
  const startQuiz = useQuizStore((state) => state.startQuiz);
  const answerQuestion = useQuizStore((state) => state.answerQuestion);
  const nextQuestion = useQuizStore((state) => state.nextQuestion);
  const finishQuiz = useQuizStore((state) => state.finishQuiz);
  const computeScore = useQuizStore((state) => state.score);
  const recordResult = useQuizStore((state) => state.recordResult);
  const recordConfusedPair = useQuizStore((state) => state.recordConfusedPair);

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

    const run = async () => {
      try {
        startQuiz(normalizedCategory, normalizedDifficulty);
        await Promise.resolve();
        scheduleErrorUpdate(null);
      } catch (err) {
        console.error(err);
        await Promise.resolve();
        scheduleErrorUpdate("クイズの開始に失敗しました");
      }
    };

    run();
  }, [normalizedCategory, normalizedDifficulty, currentSession, startQuiz, scheduleErrorUpdate]);

  const status: QuizStatus = useMemo(() => {
    if (error) return "error";
    if (!normalizedCategory) return "idle";
    if (!currentSession) return "loading";
    return currentSession.completedAt ? "completed" : "in-progress";
  }, [currentSession, normalizedCategory, error]);

  const questionNumber = currentSession ? currentSession.currentIndex + 1 : 0;

  const scoreSummary = useMemo(
    () =>
      currentSession
        ? computeScore()
        : {
            correct: 0,
            total: 0,
            percentage: 0,
          },
    [currentSession, computeScore],
  );

  const recordedSessionRef = useRef<string | null>(null);

  useEffect(() => {
    if (!currentSession?.completedAt) {
      recordedSessionRef.current = null;
      return;
    }

    if (recordedSessionRef.current === currentSession.id) {
      return;
    }

    recordResult(scoreSummary.correct, scoreSummary.total, currentSession.category);
    recordedSessionRef.current = currentSession.id;
  }, [currentSession, recordResult, scoreSummary]);

  const submitAnswer = useCallback(
    (choiceIndex: number) => {
      if (!currentSession || currentSession.completedAt) return;

      answerQuestion(choiceIndex);

      const correctIndex = currentSession.correctAnswers[currentSession.currentIndex];
      if (choiceIndex !== correctIndex) {
        const chosenId =
          currentSession.choiceSoundIds[currentSession.currentIndex]?.[choiceIndex];
        const correctId =
          currentSession.choiceSoundIds[currentSession.currentIndex]?.[correctIndex];
        if (chosenId && correctId) {
          recordConfusedPair(correctId, chosenId);
        }
      }

      const isLastQuestion = currentSession.currentIndex >= QUIZ_LENGTH - 1;
      if (isLastQuestion) {
        finishQuiz();
      } else {
        nextQuestion();
      }
    },
    [currentSession, answerQuestion, nextQuestion, finishQuiz, recordConfusedPair],
  );

  const resetQuiz = useCallback(() => {
    resetQuizStore();
    scheduleErrorUpdate(null);
  }, [scheduleErrorUpdate]);

  return {
    status,
    error,
    session: currentSession,
    questionNumber,
    totalQuestions: QUIZ_LENGTH,
    sound: currentSound(),
    choices: currentChoices(),
    submitAnswer,
    score: scoreSummary,
    resetQuiz,
  };
}
