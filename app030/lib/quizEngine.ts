import allSounds from "@/data/sounds";
import {
  DifficultyLevel,
  QuizAnswer,
  SoundData,
} from "@/types";

interface QuizGenerationOptions {
  sounds?: SoundData[];
  rng?: () => number;
}

interface ChoiceOptions {
  rng?: () => number;
}

const defaultRng = () => Math.random();

const shuffle = <T>(items: T[], rng: () => number): T[] => {
  const cloned = [...items];
  for (let i = cloned.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [cloned[i], cloned[j]] = [cloned[j], cloned[i]];
  }
  return cloned;
};

const take = <T>(items: T[], count: number): T[] => items.slice(0, count);

export const generateQuiz = (
  category: string,
  difficulty: DifficultyLevel,
  count: number,
  options: QuizGenerationOptions = {},
): SoundData[] => {
  const sounds = options.sounds ?? allSounds;
  const rng = options.rng ?? defaultRng;

  const filtered = sounds.filter(
    (sound) => sound.category === category && sound.difficulty === difficulty,
  );

  if (filtered.length < count) {
    throw new Error(`音源が不足しています: ${category} (${difficulty})`);
  }

  return take(shuffle(filtered, rng), count);
};

export const generateChoices = (
  correctSound: SoundData,
  allAvailable: SoundData[],
  options: ChoiceOptions = {},
): SoundData[] => {
  const rng = options.rng ?? defaultRng;
  const sameCategory = allAvailable.filter(
    (sound) => sound.category === correctSound.category && sound.id !== correctSound.id,
  );

  const others = allAvailable.filter((sound) => sound.id !== correctSound.id);

  const candidates = sameCategory.length >= 3 ? sameCategory : others;

  if (candidates.length < 3) {
    throw new Error("選択肢を生成するための音源が不足しています");
  }

  const wrongChoices = take(shuffle(candidates, rng), 3);
  const choices = [correctSound, ...wrongChoices];

  return shuffle(choices, rng);
};

export const checkAnswer = (correctIndex: number, answerIndex: number): boolean =>
  correctIndex === answerIndex;

export const calculateScore = (
  answers: QuizAnswer[],
  correctAnswers: number[],
): { correct: number; total: number; percentage: number } => {
  const total = answers.filter((answer) => answer !== null).length;
  if (total === 0) {
    return { correct: 0, total: 0, percentage: 0 };
  }

  let correct = 0;
  answers.forEach((answer, index) => {
    if (answer !== null && answer === correctAnswers[index]) {
      correct += 1;
    }
  });

  const percentage = Math.round(((correct / total) * 100 + Number.EPSILON) * 100) / 100;

  return { correct, total, percentage };
};
