import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AISoundDescription } from "@/app/components/AISoundDescription";
import { geminiService } from "@/lib/geminiService";

jest.mock("@/lib/geminiService", () => ({
  geminiService: {
    generateSoundDescription: jest.fn(),
  },
}));

const mockSound = {
  id: "sound-1",
  name: "ピアノ",
  filename: "",
  category: "楽器の音",
  description: "柔らかい音",
  difficulty: "beginner" as const,
};

describe("AISoundDescription", () => {
  it("renders nothing when no sound selected", () => {
    const { container } = render(<AISoundDescription sound={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("triggers description generation", async () => {
    const user = userEvent.setup();
    (geminiService.generateSoundDescription as jest.Mock).mockResolvedValue("テスト解説");

    render(<AISoundDescription sound={mockSound} />);

    await user.click(screen.getByRole("button", { name: "説明を生成" }));
    expect(geminiService.generateSoundDescription).toHaveBeenCalled();
    expect(await screen.findByText("テスト解説")).toBeInTheDocument();
  });
});
