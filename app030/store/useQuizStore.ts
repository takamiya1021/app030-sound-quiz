import { create } from "zustand";

import soundsData from "@/data/sounds";
import { generateChoices, generateQuiz } from "@/lib/quizEngine";
import {
  AppSettings,
  CategoryStat,
  ConfusedPair,
  DifficultyLevel,
  QUIZ_LENGTH,
  QuizAnswer,
  QuizSession,
  SoundData,
  UserProgress,
} from "@/types";

const generateSessionId = (): string => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `session-${Math.random().toString(36).slice(2, 10)}`;
};

const todayString = () => new Date().toISOString().slice(0, 10);

const createInitialProgress = (): UserProgress => ({
  totalQuizzes: 0,
  totalCorrect: 0,
  totalQuestions: 0,
  categoryStats: {},
  studyDays: 0,
  lastStudyDate: "",
  confusedPairs: [],
});

const createInitialSettings = (): AppSettings => ({
  masterVolume: 0.8,
  maxPlayCount: 3,
});

const createQuizSession = (
  category: string,
  difficulty: DifficultyLevel,
  sounds: SoundData[],
  choices: string[][],
  choiceSoundIds: string[][],
  correctAnswers: number[],
): QuizSession => ({
  id: generateSessionId(),
  category,
  difficulty,
  sounds,
  choices,
  choiceSoundIds,
  correctAnswers,
  currentIndex: 0,
  answers: Array<QuizAnswer>(QUIZ_LENGTH).fill(null),
  playCount: Array(QUIZ_LENGTH).fill(0),
  startedAt: new Date(),
});

export interface QuizStore {
  // State
  currentSession: QuizSession | null;
  progress: UserProgress;
  settings: AppSettings;
  sounds: SoundData[];
  isPlaying: boolean;

  // Quiz Actions
  startQuiz: (category: string, difficulty: DifficultyLevel) => void;
  answerQuestion: (answerIndex: number) => void;
  playSound: (soundId: string) => void;
  stopSound: () => void;
  nextQuestion: () => void;
  finishQuiz: () => void;

  // Progress Actions
  recordResult: (correct: number, total: number, category: string) => void;
  recordConfusedPair: (sound1Id: string, sound2Id: string) => void;

  // Sound Management
  loadSounds: () => Promise<void>;

  // Computed
  currentSound: () => SoundData | null;
  currentChoices: () => string[] | null;
  score: () => { correct: number; total: number; percentage: number };
  categoryAccuracy: (category: string) => number;
}

export const createQuizStore = () =>
  create<QuizStore>((set, get) => ({
    currentSession: null,
    progress: createInitialProgress(),
    settings: createInitialSettings(),
    sounds: soundsData,
    isPlaying: false,

    startQuiz: (category, difficulty) =>
      set((state) => {
        const quizSounds = generateQuiz(category, difficulty, QUIZ_LENGTH, {
          sounds: state.sounds,
        });

        const choiceLabels: string[][] = [];
        const choiceIds: string[][] = [];

        quizSounds.forEach((sound, index) => {
          const choiceObjects = generateChoices(sound, state.sounds);
          choiceLabels.push(choiceObjects.map((choice) => choice.name));
          choiceIds.push(choiceObjects.map((choice) => choice.id));
        });

        const correctAnswers = choiceIds.map((idSet, index) => {
          const correctId = quizSounds[index]?.id;
          const answerIndex = idSet.findIndex((id) => id === correctId);
          if (answerIndex === -1) {
            throw new Error("選択肢に正解が含まれていません");
          }
          return answerIndex;
        });

        return {
          currentSession: createQuizSession(
            category,
            difficulty,
            quizSounds,
            choiceLabels,
            choiceIds,
            correctAnswers,
          ),
          isPlaying: false,
        };
      }),

    answerQuestion: (answerIndex) =>
      set((state) => {
        if (!state.currentSession) {
          return state;
        }

        const answers = [...state.currentSession.answers];
        answers[state.currentSession.currentIndex] = answerIndex;

        return {
          currentSession: {
            ...state.currentSession,
            answers,
          },
        };
      }),

    playSound: () =>
      set((state) => {
        if (!state.currentSession) {
          return state;
        }

        const index = state.currentSession.currentIndex;
        const playCount = [...state.currentSession.playCount];
        playCount[index] += 1;

        return {
          isPlaying: true,
          currentSession: {
            ...state.currentSession,
            playCount,
          },
        };
      }),

    stopSound: () => set({ isPlaying: false }),

    nextQuestion: () =>
      set((state) => {
        if (!state.currentSession) {
          return state;
        }

        const nextIndex = Math.min(
          state.currentSession.currentIndex + 1,
          state.currentSession.sounds.length - 1,
        );

        if (nextIndex === state.currentSession.currentIndex) {
          return state;
        }

        return {
          currentSession: {
            ...state.currentSession,
            currentIndex: nextIndex,
          },
          isPlaying: false,
        };
      }),

    finishQuiz: () =>
      set((state) => {
        if (!state.currentSession) {
          return state;
        }

        return {
          currentSession: {
            ...state.currentSession,
            completedAt: new Date(),
          },
          isPlaying: false,
        };
      }),

    recordResult: (correct, total, category) =>
      set((state) => {
        const today = todayString();
        const categoryStats: Record<string, CategoryStat> = {
          ...state.progress.categoryStats,
        };
        const currentStat = categoryStats[category] ?? { correct: 0, total: 0 };

        categoryStats[category] = {
          correct: currentStat.correct + correct,
          total: currentStat.total + total,
        };

        const shouldIncrementStudyDays = state.progress.lastStudyDate !== today;

        return {
          progress: {
            ...state.progress,
            totalQuizzes: state.progress.totalQuizzes + 1,
            totalCorrect: state.progress.totalCorrect + correct,
            totalQuestions: state.progress.totalQuestions + total,
            categoryStats,
            studyDays: shouldIncrementStudyDays
              ? state.progress.studyDays + 1
              : state.progress.studyDays || 1,
            lastStudyDate: today,
          },
        };
      }),

    recordConfusedPair: (sound1Id, sound2Id) =>
      set((state) => {
        const confusedPairs: ConfusedPair[] = state.progress.confusedPairs.map((pair) => ({
          ...pair,
        }));

        const pair = confusedPairs.find(
          (candidate) =>
            (candidate.sound1 === sound1Id && candidate.sound2 === sound2Id) ||
            (candidate.sound1 === sound2Id && candidate.sound2 === sound1Id),
        );

        if (pair) {
          pair.count += 1;
        } else {
          confusedPairs.push({
            sound1: sound1Id,
            sound2: sound2Id,
            count: 1,
          });
        }

        confusedPairs.sort((a, b) => b.count - a.count);

        return {
          progress: {
            ...state.progress,
            confusedPairs,
          },
        };
      }),

    loadSounds: async () => {
      set({ sounds: soundsData });
    },

    currentSound: () => {
      const session = get().currentSession;
      if (!session) {
        return null;
      }

      return session.sounds[session.currentIndex] ?? null;
    },

    currentChoices: () => {
      const session = get().currentSession;
      if (!session) {
        return null;
      }

      return session.choices[session.currentIndex] ?? null;
    },

    score: () => {
      const session = get().currentSession;
      if (!session) {
        return { correct: 0, total: 0, percentage: 0 };
      }

      const result = session.answers.reduce(
        (acc, answer, index) => {
          if (answer === null) {
            return acc;
          }

          const total = acc.total + 1;
          const correct = acc.correct + (answer === session.correctAnswers[index] ? 1 : 0);

          return { correct, total };
        },
        { correct: 0, total: 0 },
      );

      const percentage =
        result.total > 0 ? (result.correct / result.total) * 100 : 0;

      return { correct: result.correct, total: result.total, percentage };
    },

    categoryAccuracy: (category) => {
      const stat = get().progress.categoryStats[category];
      if (!stat || stat.total === 0) {
        return 0;
      }

      return (stat.correct / stat.total) * 100;
    },
  }));

export const useQuizStore = createQuizStore();

export const resetQuizStore = () => {
  useQuizStore.setState({
    currentSession: null,
    progress: createInitialProgress(),
    settings: createInitialSettings(),
    sounds: soundsData,
    isPlaying: false,
  });
};
