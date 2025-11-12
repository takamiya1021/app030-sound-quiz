import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AIStudyPlan } from "@/app/components/AIStudyPlan";
import { geminiService } from "@/lib/geminiService";
import { resetQuizStore, useQuizStore } from "@/store/useQuizStore";

jest.mock("@/lib/geminiService", () => ({
  geminiService: {
    suggestStudyPlan: jest.fn(),
  },
}));

describe("AIStudyPlan", () => {
  beforeEach(() => {
    resetQuizStore();
  });

  it("disables button when no history", () => {
    render(<AIStudyPlan />);
    expect(screen.getByRole("button", { name: "プランを生成" })).toBeDisabled();
  });

  it("generates plan when history exists", async () => {
    const user = userEvent.setup();
    useQuizStore.setState((state) => ({
      ...state,
      progress: {
        ...state.progress,
        categoryStats: {
          ...state.progress.categoryStats,
          "楽器の音": { correct: 5, total: 10 },
        },
      },
    }));
    (geminiService.suggestStudyPlan as jest.Mock).mockResolvedValue({
      weakCategories: ["楽器の音"],
      recommendedOrder: ["楽器の音"],
      practiceSchedule: ["1日目: ..."],
    });

    render(<AIStudyPlan />);

    await user.click(screen.getByRole("button", { name: "プランを生成" }));
    expect(await screen.findByText(/1日目/)).toBeInTheDocument();
  });
});
