import {
  clearStoredSession,
  loadProgress,
  loadSession,
  loadSettings,
  saveProgress,
  saveSession,
  saveSettings,
} from "@/lib/storage";
import { QUIZ_LENGTH, QuizSession, SoundData, UserProgress } from "@/types";

const createStorageMock = () => {
  const store = new Map<string, string>();

  return {
    getItem: jest.fn((key: string) => store.get(key) ?? null),
    setItem: jest.fn((key: string, value: string) => {
      store.set(key, value);
    }),
    removeItem: jest.fn((key: string) => {
      store.delete(key);
    }),
  };
};

const createSound = (id: number): SoundData => ({
  id: `sound-${id}`,
  category: "楽器の音",
  name: `Sound ${id}`,
  filename: `sound-${id}.mp3`,
  description: "desc",
  difficulty: "beginner",
});

const createSession = (): QuizSession => ({
  id: "session-1",
  category: "楽器の音",
  difficulty: "beginner",
  sounds: Array.from({ length: QUIZ_LENGTH }, (_, index) => createSound(index)),
  choices: Array.from({ length: QUIZ_LENGTH }, () => ["A", "B", "C", "D"]),
  choiceSoundIds: Array.from({ length: QUIZ_LENGTH }, () => ["s1", "s2", "s3", "s4"]),
  correctAnswers: Array(QUIZ_LENGTH).fill(0),
  currentIndex: 0,
  answers: Array(QUIZ_LENGTH).fill(null),
  playCount: Array(QUIZ_LENGTH).fill(0),
  startedAt: new Date("2024-01-01T00:00:00Z"),
});

const createProgress = (): UserProgress => ({
  totalQuizzes: 5,
  totalCorrect: 42,
  totalQuestions: 50,
  categoryStats: {
    "楽器の音": { correct: 20, total: 25 },
  },
  studyDays: 3,
  lastStudyDate: "2024-01-01",
  confusedPairs: [
    { sound1: "s1", sound2: "s2", count: 2 },
  ],
});

describe("storage utilities", () => {
  let warnSpy: jest.SpyInstance;

  beforeEach(() => {
    (globalThis as unknown as { localStorage: Storage }).localStorage =
      createStorageMock() as unknown as Storage;
    warnSpy = jest.spyOn(console, "warn").mockImplementation(() => undefined);
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it("returns null when nothing is stored", () => {
    expect(loadProgress()).toBeNull();
    expect(loadSettings()).toBeNull();
    expect(loadSession()).toBeNull();
  });

  it("persists and restores progress data", () => {
    const progress = createProgress();

    saveProgress(progress);
    const restored = loadProgress();

    expect(restored).toEqual(progress);
  });

  it("persists and restores settings data", () => {
    const settings = {
      masterVolume: 0.7,
      maxPlayCount: 4,
      geminiApiKey: "secret",
    };

    saveSettings(settings);
    expect(loadSettings()).toEqual(settings);
  });

  it("persists and restores quiz session with dates", () => {
    const session = createSession();

    saveSession(session);
    const restored = loadSession();

    expect(restored).not.toBeNull();
    expect(restored?.startedAt).toBeInstanceOf(Date);
    expect(restored?.sounds[0].createdAt).toBeUndefined();
    expect(restored).toMatchObject({
      id: session.id,
      difficulty: session.difficulty,
    });
  });

  it("clears stored session", () => {
    saveSession(createSession());
    clearStoredSession();

    expect(loadSession()).toBeNull();
  });

  it("handles malformed data gracefully", () => {
    const storage = globalThis.localStorage;
    storage.setItem("app030:progress", "{ invalid json");

    expect(loadProgress()).toBeNull();
  });
});
