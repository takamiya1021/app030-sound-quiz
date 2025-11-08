import sounds from "@/data/sounds";
import {
  calculateScore,
  checkAnswer,
  generateChoices,
  generateQuiz,
} from "@/lib/quizEngine";
import { DifficultyLevel, QuizAnswer, SoundData } from "@/types";

const buildSound = (
  id: string,
  category: string,
  difficulty: DifficultyLevel,
): SoundData => ({
  id,
  category,
  difficulty,
  name: id,
  filename: `sounds/${id}.mp3`,
  description: `desc ${id}`,
});

const SAMPLE_SOUNDS: SoundData[] = [
  buildSound("a-1", "A", "beginner"),
  buildSound("a-2", "A", "beginner"),
  buildSound("a-3", "A", "beginner"),
  buildSound("a-4", "A", "beginner"),
  buildSound("b-1", "B", "beginner"),
  buildSound("b-2", "B", "beginner"),
  buildSound("b-3", "B", "intermediate"),
  buildSound("b-4", "B", "advanced"),
];

const fixedRng = () => 0.1;

describe("quizEngine", () => {
  describe("generateQuiz", () => {
    it("selects random sounds for the requested category and difficulty", () => {
      const quiz = generateQuiz("A", "beginner", 3, { sounds: SAMPLE_SOUNDS, rng: fixedRng });

      expect(quiz).toHaveLength(3);
      quiz.forEach((sound) => {
        expect(sound.category).toBe("A");
        expect(sound.difficulty).toBe("beginner");
      });
    });

    it("throws when there are not enough sounds", () => {
      expect(() =>
        generateQuiz("B", "advanced", 2, { sounds: SAMPLE_SOUNDS, rng: fixedRng }),
      ).toThrow("音源が不足しています");
    });

    it("falls back to default dataset when sounds option is omitted", () => {
      const quiz = generateQuiz("楽器の音", "beginner", 5, { rng: fixedRng });
      expect(quiz).toHaveLength(5);
      quiz.forEach((sound) => expect(sound.category).toBe("楽器の音"));
    });
  });

  describe("generateChoices", () => {
    const correct = buildSound("a-1", "A", "beginner");

    it("returns 4 shuffled unique choices including the correct answer", () => {
      const choices = generateChoices(correct, SAMPLE_SOUNDS, { rng: fixedRng });

      expect(choices).toHaveLength(4);
      expect(new Set(choices.map((c) => c.id)).size).toBe(4);
      expect(choices.find((c) => c.id === correct.id)).toBeDefined();
    });

    it("falls back to other categories when insufficient distractors", () => {
      const limited = [
        correct,
        buildSound("a-2", "A", "beginner"),
        buildSound("b-1", "B", "beginner"),
        buildSound("b-2", "B", "beginner"),
      ];

      const choices = generateChoices(correct, limited, { rng: fixedRng });
      expect(choices).toHaveLength(4);
      expect(new Set(choices.map((c) => c.id)).size).toBe(4);
    });
  });

  describe("checkAnswer", () => {
    it("compares indices accurately", () => {
      expect(checkAnswer(2, 2)).toBe(true);
      expect(checkAnswer(1, 3)).toBe(false);
    });
  });

  describe("calculateScore", () => {
    it("calculates correct, total, and percentage", () => {
      const answers: QuizAnswer[] = [0, 1, null, 2];
      const correctAnswers = [0, 3, 1, 2];

      const result = calculateScore(answers, correctAnswers);
      expect(result).toEqual({ correct: 2, total: 3, percentage: 66.67 });
    });

    it("handles cases with no answered questions", () => {
      const answers: QuizAnswer[] = [null, null];
      const correctAnswers = [0, 1];

      const result = calculateScore(answers, correctAnswers);
      expect(result).toEqual({ correct: 0, total: 0, percentage: 0 });
    });
  });
});
