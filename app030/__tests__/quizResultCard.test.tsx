import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { QuizResultCard } from "@/app/components/QuizResultCard";

describe("QuizResultCard", () => {
  it("renders score and triggers callbacks", async () => {
    const user = userEvent.setup();
    const handleRetry = jest.fn();
    const handleBack = jest.fn();

    render(
      <QuizResultCard
        correct={8}
        total={10}
        percentage={80}
        onRetry={handleRetry}
        onBack={handleBack}
      />,
    );

    expect(screen.getByText(/80\.0%/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "もう一度挑戦" }));
    await user.click(screen.getByRole("button", { name: "ホームに戻る" }));

    expect(handleRetry).toHaveBeenCalledTimes(1);
    expect(handleBack).toHaveBeenCalledTimes(1);
  });
});
