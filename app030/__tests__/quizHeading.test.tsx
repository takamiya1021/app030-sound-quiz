import { render, screen } from "@testing-library/react";

import { QuizHeading } from "@/app/components/QuizHeading";

describe("QuizHeading", () => {
  it("shows progress and labels", () => {
    render(
      <QuizHeading
        questionNumber={3}
        totalQuestions={10}
        category="楽器の音"
        difficulty="beginner"
      />,
    );

    expect(screen.getByText("楽器の音")).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveStyle({ width: "30%" });
  });
});
