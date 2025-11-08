export const QUIZ_LENGTH = 10;

export const DIFFICULTY_LEVELS = [
  "beginner",
  "intermediate",
  "advanced",
] as const;

export type DifficultyLevel = (typeof DIFFICULTY_LEVELS)[number];

export interface SoundData {
  id: string;
  category: string;
  name: string;
  filename: string;
  description: string;
  difficulty: DifficultyLevel;
  aiDescription?: string;
  createdAt?: Date;
}

export interface QuizQuestion {
  soundId: string;
  choices: string[];
  correctAnswer: number;
}

export type QuizAnswer = number | null;

export interface QuizSession {
  id: string;
  category: string;
  difficulty: DifficultyLevel;
  sounds: SoundData[];
  choices: string[][];
  choiceSoundIds: string[][];
  correctAnswers: number[];
  currentIndex: number;
  answers: QuizAnswer[];
  playCount: number[];
  startedAt: Date;
  completedAt?: Date;
}

export interface CategoryStat {
  correct: number;
  total: number;
}

export interface UserProgress {
  totalQuizzes: number;
  totalCorrect: number;
  totalQuestions: number;
  categoryStats: Record<string, CategoryStat>;
  studyDays: number;
  lastStudyDate: string;
  confusedPairs: ConfusedPair[];
}

export interface ConfusedPair {
  sound1: string;
  sound2: string;
  count: number;
}

export interface AppSettings {
  geminiApiKey?: string;
  masterVolume: number;
  maxPlayCount: number;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

export const isDifficultyLevel = (value: unknown): value is DifficultyLevel =>
  typeof value === "string" && DIFFICULTY_LEVELS.includes(value as DifficultyLevel);

export const isSoundData = (value: unknown): value is SoundData => {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    typeof value.category === "string" &&
    typeof value.name === "string" &&
    typeof value.filename === "string" &&
    typeof value.description === "string" &&
    isDifficultyLevel(value.difficulty) &&
    (value.createdAt === undefined || value.createdAt instanceof Date)
  );
};

export const isQuizSession = (value: unknown): value is QuizSession => {
  if (!isRecord(value)) {
    return false;
  }

  if (
    typeof value.id !== "string" ||
    typeof value.category !== "string" ||
    !isDifficultyLevel(value.difficulty) ||
    !Array.isArray(value.sounds) ||
    value.sounds.length !== QUIZ_LENGTH ||
    !value.sounds.every(isSoundData) ||
    !Array.isArray(value.choices) ||
    value.choices.length !== QUIZ_LENGTH ||
    !value.choices.every(
      (choiceSet) =>
        Array.isArray(choiceSet) &&
        choiceSet.length === 4 &&
        choiceSet.every((choice) => typeof choice === "string"),
    ) ||
    !Array.isArray(value.choiceSoundIds) ||
    value.choiceSoundIds.length !== QUIZ_LENGTH ||
    !value.choiceSoundIds.every(
      (choiceSet) =>
        Array.isArray(choiceSet) &&
        choiceSet.length === 4 &&
        choiceSet.every((choice) => typeof choice === "string"),
    ) ||
    !Array.isArray(value.correctAnswers) ||
    value.correctAnswers.length !== QUIZ_LENGTH ||
    !value.correctAnswers.every(
      (answer) => typeof answer === "number" && Number.isInteger(answer),
    ) ||
    typeof value.currentIndex !== "number" ||
    !Array.isArray(value.answers) ||
    value.answers.length !== QUIZ_LENGTH ||
    !value.answers.every(
      (answer) => answer === null || (typeof answer === "number" && Number.isInteger(answer)),
    ) ||
    !Array.isArray(value.playCount) ||
    value.playCount.length !== QUIZ_LENGTH ||
    !value.playCount.every((count) => typeof count === "number" && count >= 0)
  ) {
    return false;
  }

  return (
    value.startedAt instanceof Date &&
    (value.completedAt === undefined || value.completedAt instanceof Date)
  );
};
