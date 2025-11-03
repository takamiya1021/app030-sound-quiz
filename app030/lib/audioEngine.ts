type FetchLike = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

interface AudioEngineOptions {
  createContext?: () => AudioContext;
  fetchImpl?: FetchLike;
  targetPeak?: number;
}

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const resolveSoundPath = (filename: string): string => {
  const trimmed = filename.replace(/^\/+/, "");
  return trimmed.startsWith("sounds/") ? `/${trimmed}` : `/sounds/${trimmed}`;
};

export class AudioEngine {
  private readonly fetchImpl: FetchLike | null;

  private readonly createContext: () => AudioContext;

  private readonly targetPeak: number;

  private context: AudioContext | null = null;

  private gainNode: GainNode | null = null;

  private buffers: Map<string, AudioBuffer> = new Map();

  private currentSource: AudioBufferSourceNode | null = null;

  private playing = false;

  public constructor(options: AudioEngineOptions = {}) {
    this.fetchImpl = options.fetchImpl ?? (typeof fetch === "function" ? fetch.bind(globalThis) : null);
    this.createContext = options.createContext ?? (() => new AudioContext());
    this.targetPeak = options.targetPeak ?? 0.8;
  }

  public async init(): Promise<void> {
    if (this.context) {
      return;
    }

    const ctx = this.createContext();
    const gain = ctx.createGain();
    gain.connect(ctx.destination);
    gain.gain.value = clamp(gain.gain.value, 0, 1);

    this.context = ctx;
    this.gainNode = gain;
  }

  public isPlaying(): boolean {
    return this.playing;
  }

  public async loadSound(filename: string): Promise<AudioBuffer> {
    const path = resolveSoundPath(filename);

    if (this.buffers.has(path)) {
      return this.buffers.get(path)!;
    }

    if (!this.fetchImpl) {
      throw new Error("fetch API is not available in this environment");
    }

    await this.init();

    const response = await this.fetchImpl(path);
    if (!response.ok) {
      throw new Error(`音源の読み込みに失敗しました: ${path} (${response.status})`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const decoded = await this.context!.decodeAudioData(arrayBuffer.slice(0));
    const normalised = this.normalizeVolume(decoded);

    this.buffers.set(path, normalised);
    return normalised;
  }

  public async playSound(filename: string): Promise<void> {
    const buffer = await this.loadSound(filename);
    await this.context?.resume?.();

    if (!this.context || !this.gainNode) {
      throw new Error("AudioContext is not initialised");
    }

    this.stopSound();

    const source = this.context.createBufferSource();
    source.buffer = buffer;
    source.connect(this.gainNode);
    source.onended = () => {
      if (this.currentSource === source) {
        this.currentSource = null;
        this.playing = false;
      }
    };

    source.start(0);
    this.currentSource = source;
    this.playing = true;
  }

  public stopSound(): void {
    const source = this.currentSource;
    if (source) {
      try {
        source.stop(0);
      } catch (error) {
        // no-op: stopping an already stopped source can throw in some browsers
      }
      if (typeof source.disconnect === "function") {
        source.disconnect();
      }
    }

    this.currentSource = null;
    this.playing = false;
  }

  public setVolume(volume: number): void {
    if (!this.gainNode) {
      return;
    }

    this.gainNode.gain.value = clamp(volume, 0, 1);
  }

  public async preload(filenames: string[]): Promise<void> {
    const unique = Array.from(new Set(filenames));
    await Promise.all(unique.map((name) => this.loadSound(name).catch(() => {})));
  }

  public normalizeVolume(buffer: AudioBuffer): AudioBuffer {
    const { numberOfChannels } = buffer;
    if (numberOfChannels === 0) {
      return buffer;
    }

    let peak = 0;
    for (let channel = 0; channel < numberOfChannels; channel += 1) {
      const data = buffer.getChannelData(channel);
      for (let i = 0; i < data.length; i += 1) {
        const value = Math.abs(data[i]);
        if (value > peak) {
          peak = value;
        }
      }
    }

    if (peak === 0) {
      return buffer;
    }

    const scale = this.targetPeak / peak;
    if (scale === 1) {
      return buffer;
    }

    for (let channel = 0; channel < numberOfChannels; channel += 1) {
      const data = buffer.getChannelData(channel);
      for (let i = 0; i < data.length; i += 1) {
        data[i] *= scale;
      }
    }

    return buffer;
  }
}

export const audioEngine = new AudioEngine();
