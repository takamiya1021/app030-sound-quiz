import "@testing-library/jest-dom";
import React from "react";

class AudioContextMock {
  public currentTime = 0;

  public destination = {};

  public createBufferSource = jest.fn(() => ({
    buffer: null as unknown,
    connect: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
  }));

  public createGain = jest.fn(() => ({
    connect: jest.fn(),
    gain: { value: 1 },
  }));

  public decodeAudioData = jest.fn(async () => ({
    duration: 0,
    sampleRate: 44100,
  }));

  public resume = jest.fn(async () => undefined);

  public suspend = jest.fn(async () => undefined);

  public close = jest.fn(async () => undefined);
}

Object.defineProperty(globalThis, "AudioContext", {
  configurable: true,
  writable: true,
  value: AudioContextMock,
});

jest.mock("next/link", () => {
  const MockLink = React.forwardRef<HTMLAnchorElement, React.ComponentPropsWithoutRef<"a">>(
    ({ href = "#", children, ...rest }, ref) =>
      React.createElement("a", { href, ref, ...rest }, children),
  );
  MockLink.displayName = "MockNextLink";
  return MockLink;
});
