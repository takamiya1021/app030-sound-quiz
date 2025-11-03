import { AudioEngine } from "@/lib/audioEngine";

const createMockBuffer = (samples: number[]): AudioBuffer => {
  const data = Float32Array.from(samples);
  return {
    numberOfChannels: 1,
    getChannelData: jest.fn(() => data),
    sampleRate: 44100,
    duration: samples.length / 44100,
  } as unknown as AudioBuffer;
};

const createMockContext = () => {
  const gainNode = {
    connect: jest.fn(),
    gain: { value: 1 },
  };

  const sources: Array<Record<string, unknown>> = [];

  const context = {
    destination: {},
    currentTime: 0,
    createGain: jest.fn(() => gainNode),
    createBufferSource: jest.fn(() => {
      let onended: (() => void) | null = null;
      const source = {
        buffer: null as AudioBuffer | null,
        connect: jest.fn(),
        start: jest.fn(() => undefined),
        stop: jest.fn(() => {
          onended?.();
        }),
        disconnect: jest.fn(),
        onended: null as (() => void) | null,
      };

      Object.defineProperty(source, "onended", {
        get: () => onended,
        set: (value) => {
          onended = value;
        },
      });

      sources.push(source);
      return source;
    }),
    decodeAudioData: jest.fn(async () => createMockBuffer([0.1, -0.25, 0.4])),
    resume: jest.fn(async () => undefined),
  };

  return { context: context as unknown as AudioContext, gainNode, sources };
};

const createMockFetch = () => {
  const buffer = new ArrayBuffer(8);
  const fetchMock = jest.fn(async () => ({
    ok: true,
    status: 200,
    arrayBuffer: async () => buffer,
  }));

  return { fetchMock, buffer };
};

describe("AudioEngine", () => {
  it("initialises audio context lazily and caches decoded buffers", async () => {
    const { fetchMock } = createMockFetch();
    const { context } = createMockContext();

    const engine = new AudioEngine({
      createContext: () => context,
      fetchImpl: fetchMock,
    });

    const first = await engine.loadSound("instruments/piano.mp3");
    const second = await engine.loadSound("instruments/piano.mp3");

    expect(first).toBe(second);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("plays and stops audio buffers while tracking state", async () => {
    const { fetchMock } = createMockFetch();
    const { context, gainNode, sources } = createMockContext();
    const engine = new AudioEngine({
      createContext: () => context,
      fetchImpl: fetchMock,
    });

    await engine.playSound("animals/cat.mp3");

    expect(engine.isPlaying()).toBe(true);
    expect(sources).toHaveLength(1);
    expect(sources[0]?.connect).toHaveBeenCalledWith(gainNode);

    engine.stopSound();
    expect(engine.isPlaying()).toBe(false);
  });

  it("clamps master volume between 0 and 1", async () => {
    const { fetchMock } = createMockFetch();
    const { context, gainNode } = createMockContext();

    const engine = new AudioEngine({
      createContext: () => context,
      fetchImpl: fetchMock,
    });

    await engine.init();
    engine.setVolume(1.5);
    expect(gainNode.gain.value).toBe(1);

    engine.setVolume(-0.2);
    expect(gainNode.gain.value).toBe(0);
  });

  it("normalises audio buffers to peak 0.8", () => {
    const buffer = createMockBuffer([0.2, -0.5, 0.3]);
    const engine = new AudioEngine();
    const normalised = engine.normalizeVolume(buffer);
    const data = normalised.getChannelData(0);

    expect(data[0]).toBeCloseTo(0.32);
    expect(data[1]).toBeCloseTo(-0.8);
    expect(data[2]).toBeCloseTo(0.48);
  });

  it("preloads a batch of sounds only once per unique asset", async () => {
    const { fetchMock } = createMockFetch();
    const { context } = createMockContext();

    const engine = new AudioEngine({
      createContext: () => context,
      fetchImpl: fetchMock,
    });

    await engine.preload([
      "effects/applause.mp3",
      "effects/applause.mp3",
      "nature/rain.mp3",
    ]);

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
