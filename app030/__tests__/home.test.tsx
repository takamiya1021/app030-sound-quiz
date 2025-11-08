import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Home } from "@/app/components/Home";

const mockEngine = {
  playSound: jest.fn().mockResolvedValue(undefined),
  stopSound: jest.fn(),
};

describe("Home component", () => {
  it("renders hero text and statistics", () => {
    render(<Home previewEngine={mockEngine} />);

    expect(
      screen.getByRole("heading", { name: /音当てクイズで/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("音源数")).toBeInTheDocument();
    expect(screen.getByText("50+")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "クイズを始める →" })).toBeInTheDocument();
  });

  it("updates selected category when a card is clicked", async () => {
    const user = userEvent.setup();
    render(<Home previewEngine={mockEngine} />);

    const categoryButtons = screen.getAllByRole("button", { name: /音源/ });
    expect(categoryButtons.length).toBeGreaterThan(1);

    await user.click(categoryButtons[1]);
    expect(categoryButtons[1]).toHaveAttribute("aria-pressed", "true");
  });
});
