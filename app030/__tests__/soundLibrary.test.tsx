import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { SoundLibrary } from "@/app/components/SoundLibrary";

jest.mock("@/app/components/AudioPlayer", () => ({
  AudioPlayer: ({ soundName }: { soundName: string }) => (
    <div data-testid="audio-player">{soundName}</div>
  ),
}));

describe("SoundLibrary", () => {
  it("renders category tabs and search input", () => {
    render(<SoundLibrary />);

    expect(screen.getAllByText("楽器の音").length).toBeGreaterThan(0);
    expect(screen.getByPlaceholderText("音の名前や説明文で検索")).toBeInTheDocument();
  });

  it("updates preview when a sound is clicked", async () => {
    const user = userEvent.setup();
    render(<SoundLibrary initialCategory="楽器の音" />);

    const soundButton = screen.getByRole("button", { name: /ピアノ/ });
    await user.click(soundButton);

    expect(screen.getByTestId("audio-player")).toBeInTheDocument();
  });

  it("filters by search term", async () => {
    const user = userEvent.setup();
    render(<SoundLibrary />);

    const animalsTab = screen.getByRole("button", { name: /動物の鳴き声/ });
    await user.click(animalsTab);

    const searchInput = screen.getByPlaceholderText("音の名前や説明文で検索");
    await user.type(searchInput, "猫");

    expect(screen.getByRole("button", { name: /猫/ })).toBeInTheDocument();
  });
});
