import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AudioPlayer } from "@/app/components/AudioPlayer";

describe("AudioPlayer", () => {
  it("plays sound and decrements remaining count", async () => {
    const user = userEvent.setup();
    const engine = {
      playSound: jest.fn().mockResolvedValue(undefined),
      stopSound: jest.fn(),
    };

    render(
      <AudioPlayer
        soundName="ピアノ"
        filename="instruments/piano.mp3"
        maxPlayCount={2}
        engine={engine}
      />,
    );

    const button = screen.getByRole("button", { name: /ピアノ を再生/ });
    expect(screen.getByText(/残り 2 \/ 2 回/)).toBeInTheDocument();

    await user.click(button);
    expect(engine.playSound).toHaveBeenCalledWith("instruments/piano.mp3");
    expect(screen.getByText(/残り 1 \/ 2 回/)).toBeInTheDocument();
  });

  it("shows an error message when playback fails", async () => {
    const user = userEvent.setup();
    const engine = {
      playSound: jest.fn().mockRejectedValue(new Error("fail")),
      stopSound: jest.fn(),
      isSupported: () => true,
    };

    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => undefined);

    render(
      <AudioPlayer
        soundName="ピアノ"
        filename="instruments/piano.mp3"
        engine={engine}
      />,
    );

    const button = screen.getByRole("button", { name: /ピアノ を再生/ });
    await user.click(button);
    expect(await screen.findByText("fail")).toBeInTheDocument();
    errorSpy.mockRestore();
  });

  it("disables playback when Web Audio is unsupported", () => {
    const engine = {
      playSound: jest.fn(),
      stopSound: jest.fn(),
      isSupported: () => false,
    };

    render(
      <AudioPlayer
        soundName="ピアノ"
        filename="instruments/piano.mp3"
        engine={engine}
      />,
    );

    const button = screen.getByRole("button", { name: /ピアノ を再生/ });
    expect(button).toBeDisabled();
    expect(screen.getByText(/サポートされていません/)).toBeInTheDocument();
  });
});
