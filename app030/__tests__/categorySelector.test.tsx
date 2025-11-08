import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { CategorySelector, type CategoryInfo } from "@/app/components/CategorySelector";

const categories: CategoryInfo[] = [
  {
    id: "instruments",
    label: "楽器の音",
    description: "音色の違いにフォーカス",
    icon: "🎹",
    totalSounds: 15,
  },
  {
    id: "animals",
    label: "動物の鳴き声",
    description: "似た鳴き声の判別",
    icon: "🐾",
    totalSounds: 12,
  },
];

describe("CategorySelector", () => {
  it("renders category cards and handles selection", async () => {
    const user = userEvent.setup();
    const handleSelect = jest.fn();

    render(
      <CategorySelector
        categories={categories}
        selectedId="instruments"
        onSelect={handleSelect}
      />,
    );

    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(2);
    expect(buttons[0]).toHaveAttribute("aria-pressed", "true");

    await user.click(buttons[1]);
    expect(handleSelect).toHaveBeenCalledWith("animals");
  });
});
