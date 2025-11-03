import {
  DIFFICULTY_LEVELS,
  QUIZ_LENGTH,
  isQuizSession,
  isSoundData,
} from "@/types";

describe("domain types", () => {
  const sound = {
    id: "s-001",
    category: "楽器の音",
    name: "ピアノ",
    filename: "piano.mp3",
    description: "鍵盤楽器の代表格。",
    difficulty: "beginner",
  };

  it("exposes difficulty levels", () => {
    expect(DIFFICULTY_LEVELS).toEqual(["beginner", "intermediate", "advanced"]);
  });

  it("validates sound data shape", () => {
    expect(isSoundData(sound)).toBe(true);
    expect(
      isSoundData({
        ...sound,
        difficulty: "unknown",
      }),
    ).toBe(false);
    expect(
      isSoundData({
        ...sound,
        filename: 123,
      }),
    ).toBe(false);
  });

  it("validates quiz session shape", () => {
    const session = {
      id: "q-001",
      category: "動物の鳴き声",
      difficulty: "beginner",
      sounds: Array(QUIZ_LENGTH).fill(sound),
      correctAnswers: Array(QUIZ_LENGTH).fill(0),
      currentIndex: 0,
      answers: Array(QUIZ_LENGTH).fill(null),
      playCount: Array(QUIZ_LENGTH).fill(0),
      startedAt: new Date(),
    };

    expect(isQuizSession(session)).toBe(true);

    expect(
      isQuizSession({
        ...session,
        sounds: [],
      }),
    ).toBe(false);
    expect(
      isQuizSession({
        ...session,
        answers: ["foo"],
      }),
    ).toBe(false);
  });
});
