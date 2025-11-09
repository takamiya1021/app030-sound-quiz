import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AIStudyPlan } from "@/app/components/AIStudyPlan";
import { geminiService } from "@/lib/geminiService";
import { useQuizStore } from "@/store/useQuizStore";

jest.mock("@/lib/geminiService", () => ({
  geminiService: {
    suggestStudyPlan: jest.fn(),
  },
}));

jest.mock("@/store/useQuizStore");

describe("AIStudyPlan", () => {
  it("disables button when no history", () => {
    (useQuizStore as jest.Mock).mockImplementation((selector) =>
      selector({ progress: { categoryStats: {} } }),
    );
    render(<AIStudyPlan />);
    expect(screen.getByRole("button", { name: "プランを生成" })).toBeDisabled();
  });

  it("generates plan when history exists", async () => {
    const user = userEvent.setup();
    (useQuizStore as jest.Mock).mockImplementation((selector) =>
      selector({
        progress: { categoryStats: { "楽器の音": { correct: 5, total: 10 } } },
      }),
    );
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
