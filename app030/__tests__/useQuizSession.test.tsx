import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { useQuizSession } from "@/app/hooks/useQuizSession";
import { resetQuizStore } from "@/store/useQuizStore";

function Harness({
  category,
  difficulty,
}: {
  category?: string | null;
  difficulty?: string | null;
}) {
  const quiz = useQuizSession(category, difficulty);

  return (
    <div>
      <span data-testid="status">{quiz.status}</span>
      <span data-testid="question">{quiz.questionNumber}</span>
      <span data-testid="difficulty">{quiz.session?.difficulty ?? "none"}</span>
      {quiz.session && (
        <button type="button" onClick={() => quiz.submitAnswer(0)}>
          answer
        </button>
      )}
    </div>
  );
}

describe("useQuizSession", () => {
  beforeEach(() => {
    resetQuizStore();
  });

  it("initialises a quiz session automatically", () => {
    render(<Harness category="楽器の音" difficulty="beginner" />);

    expect(screen.getByTestId("status").textContent).toBe("in-progress");
    expect(screen.getByTestId("question").textContent).toBe("1");
  });

  it("falls back to beginner difficulty for invalid value", () => {
    render(<Harness category="楽器の音" difficulty="expert" />);

    expect(screen.getByTestId("difficulty").textContent).toBe("beginner");
  });

  it("marks quiz as completed after answering all questions", async () => {
    const user = userEvent.setup();
    render(<Harness category="楽器の音" difficulty="beginner" />);

    const button = await screen.findByRole("button", { name: "answer" });
    for (let i = 0; i < 10; i += 1) {
      await user.click(button);
    }

    expect(screen.getByTestId("status").textContent).toBe("completed");
  });
});
