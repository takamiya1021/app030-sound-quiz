import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AIListeningTips } from "@/app/components/AIListeningTips";
import { geminiService } from "@/lib/geminiService";

jest.mock("@/lib/geminiService", () => ({
  geminiService: {
    generateListeningTips: jest.fn(),
  },
}));

const sound = {
  id: "s1",
  name: "ピアノ",
  filename: "",
  category: "楽器の音",
  description: "desc",
  difficulty: "beginner" as const,
};

describe("AIListeningTips", () => {
  it("renders message when no pair", () => {
    render(<AIListeningTips soundA={null} soundB={null} />);
    expect(screen.getByText(/比較する音がありません/)).toBeInTheDocument();
  });

  it("generates tips", async () => {
    const user = userEvent.setup();
    (geminiService.generateListeningTips as jest.Mock).mockResolvedValue({
      differences: ["diff"],
      focusPoints: ["focus"],
      tips: ["tip"],
    });

    render(<AIListeningTips soundA={sound} soundB={{ ...sound, id: "s2", name: "ギター" }} />);
    await user.click(screen.getByRole("button", { name: "ヒントを生成" }));
    expect(await screen.findByText("diff")).toBeInTheDocument();
  });
});
