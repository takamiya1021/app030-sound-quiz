import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { QuizChoices } from "@/app/components/QuizChoices";

describe("QuizChoices", () => {
  it("calls onSelect when a choice is clicked", async () => {
    const user = userEvent.setup();
    const handleSelect = jest.fn();

    render(
      <QuizChoices
        choices={["ピアノ", "ギター", "フルート", "サックス"]}
        selectedIndex={null}
        onSelect={handleSelect}
      />,
    );

    await user.click(screen.getByRole("button", { name: /ギター/ }));
    expect(handleSelect).toHaveBeenCalledWith(1);
  });

  it("disables interaction when disabled is true", async () => {
    const user = userEvent.setup();
    const handleSelect = jest.fn();

    render(
      <QuizChoices
        choices={["ピアノ", "ギター", "フルート", "サックス"]}
        selectedIndex={2}
        disabled
        onSelect={handleSelect}
      />,
    );

    const button = screen.getByRole("button", { name: /フルート/ });
    await user.click(button);
    expect(handleSelect).not.toHaveBeenCalled();
  });
});
