import { createQuizStore } from "@/store/useQuizStore";
import { QUIZ_LENGTH, DifficultyLevel, SoundData } from "@/types";

const buildSound = (
  id: number,
  category: string,
  difficulty: DifficultyLevel,
): SoundData => ({
  id: `sound-${id}`,
  category,
  name: `Sound ${id}`,
  filename: `sound-${id}.mp3`,
  description: `Description ${id}`,
  difficulty,
});

const buildSounds = () => [
  ...Array.from({ length: QUIZ_LENGTH + 2 }, (_, index) =>
    buildSound(index, "楽器の音", "beginner"),
  ),
  ...Array.from({ length: QUIZ_LENGTH }, (_, index) =>
    buildSound(index + 100, "動物の鳴き声", "intermediate"),
  ),
];

describe("useQuizStore", () => {
  it("starts a quiz with filtered sounds", () => {
    const store = createQuizStore();
    store.setState({ sounds: buildSounds() });

    store.getState().startQuiz("楽器の音", "beginner");
    const session = store.getState().currentSession;

    expect(session).not.toBeNull();
    expect(session?.sounds).toHaveLength(QUIZ_LENGTH);
    expect(
      session?.sounds.every(
        (sound) => sound.category === "楽器の音" && sound.difficulty === "beginner",
      ),
    ).toBe(true);
    expect(session?.answers).toEqual(Array(QUIZ_LENGTH).fill(null));
    expect(session?.choices.every((choiceSet) => choiceSet.length === 4)).toBe(true);
  });

  it("records answers and advances the quiz", () => {
    const store = createQuizStore();
    store.setState({ sounds: buildSounds() });
    store.getState().startQuiz("楽器の音", "beginner");

    store.getState().answerQuestion(0);
    expect(store.getState().currentSession?.answers[0]).toBe(0);

    store.getState().nextQuestion();
    expect(store.getState().currentSession?.currentIndex).toBe(1);
  });

  it("tracks playback count and playing flag", () => {
    const store = createQuizStore();
    store.setState({ sounds: buildSounds() });
    store.getState().startQuiz("楽器の音", "beginner");

    store.getState().playSound("sound-0");
    expect(store.getState().isPlaying).toBe(true);
    expect(store.getState().currentSession?.playCount[0]).toBe(1);

    store.getState().stopSound();
    expect(store.getState().isPlaying).toBe(false);
  });

  it("calculates score based on correct answers", () => {
    const store = createQuizStore();
    store.setState({ sounds: buildSounds() });
    store.getState().startQuiz("楽器の音", "beginner");

    const baseSession = store.getState().currentSession!;
    const answers = [0, null, null, 2, null, null, null, null, null, null];
    const correctAnswers = [0, 3, 1, 1, 1, 0, 0, 0, 0, 0];

    store.setState({
      currentSession: {
        ...baseSession,
        answers,
        correctAnswers,
      },
    });

    const score = store.getState().score();
    expect(score.correct).toBe(1);
    expect(score.total).toBe(2);
  });

  it("updates progress metrics after recording results", () => {
    const store = createQuizStore();
    const today = new Date().toISOString().slice(0, 10);

    store.getState().recordResult(7, 10, "楽器の音");
    const progress = store.getState().progress;

    expect(progress.totalQuizzes).toBe(1);
    expect(progress.totalCorrect).toBe(7);
    expect(progress.totalQuestions).toBe(10);
    expect(progress.categoryStats["楽器の音"]).toEqual({ correct: 7, total: 10 });
    expect(progress.lastStudyDate).toBe(today);
    expect(progress.studyDays).toBe(1);
  });

  it("tracks confused sound pairs", () => {
    const store = createQuizStore();

    store.getState().recordConfusedPair("s1", "s2");
    store.getState().recordConfusedPair("s2", "s1");

    expect(store.getState().progress.confusedPairs).toEqual([
      { sound1: "s1", sound2: "s2", count: 2 },
    ]);
  });
});
