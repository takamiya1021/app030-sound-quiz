import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { QuizScreen } from "@/app/components/QuizScreen";
import { useQuizSession } from "@/app/hooks/useQuizSession";
import { QuizSession } from "@/types";

jest.mock("@/app/hooks/useQuizSession");

const mockUseQuizSession = useQuizSession as jest.MockedFunction<typeof useQuizSession>;

const baseQuizState = {
  status: "loading" as const,
  error: null,
  session: null,
  questionNumber: 0,
  totalQuestions: 10,
  sound: null,
  choices: null,
  submitAnswer: jest.fn(),
  score: { correct: 0, total: 0, percentage: 0 },
  resetQuiz: jest.fn(),
};

describe("QuizScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows loading indicator", () => {
    mockUseQuizSession.mockReturnValue(baseQuizState);
    render(<QuizScreen />);
    expect(screen.getByText(/音声を準備中/)).toBeInTheDocument();
  });

  it("renders question and choices when in-progress", () => {
    const sampleSound = {
      id: "sound-1",
      category: "楽器の音",
      name: "ピアノ",
      filename: "instruments/piano.mp3",
      description: "",
      difficulty: "beginner" as const,
    };

    const quizSession: QuizSession = {
      id: "session-1",
      category: "楽器の音",
      difficulty: "beginner",
      currentIndex: 0,
      answers: Array(10).fill(null),
      sounds: Array(10).fill(sampleSound),
      choices: Array(10).fill(["ピアノ", "ギター", "フルート", "サックス"]),
      choiceSoundIds: Array(10).fill(["sound-1", "sound-2", "sound-3", "sound-4"]),
      correctAnswers: Array(10).fill(0),
      playCount: Array(10).fill(0),
      startedAt: new Date(),
    };

    mockUseQuizSession.mockReturnValue({
      ...baseQuizState,
      status: "in-progress",
      session: quizSession,
      questionNumber: 1,
      sound: quizSession.sounds[0],
      choices: quizSession.choices[0],
    });

    render(<QuizScreen />);

    expect(screen.getByText(/楽器の音/)).toBeInTheDocument();
    expect(screen.getByText("ギター")).toBeInTheDocument();
  });

  it("shows error state and allows retry", async () => {
    const user = userEvent.setup();
    const resetQuiz = jest.fn();
    mockUseQuizSession.mockReturnValue({
      ...baseQuizState,
      status: "error",
      error: "network",
      resetQuiz,
    });

    render(<QuizScreen />);

    await user.click(screen.getByRole("button", { name: "再読み込み" }));
    expect(resetQuiz).toHaveBeenCalled();
  });

  it("renders result card after completion", () => {
    mockUseQuizSession.mockReturnValue({
      ...baseQuizState,
      status: "completed",
      score: { correct: 7, total: 10, percentage: 70 },
      resetQuiz: jest.fn(),
    });

    render(<QuizScreen />);

    expect(screen.getByText(/70\.0%/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "ホームに戻る" })).toBeInTheDocument();
  });
});
