'use client';

import { useState } from "react";

import { audioEngine } from "@/lib/audioEngine";

type AudioEngineLike = {
  playSound: (filename: string) => Promise<void>;
  stopSound: () => void;
};

interface AudioPlayerProps {
  soundName: string;
  filename: string;
  maxPlayCount?: number;
  engine?: AudioEngineLike;
}

export function AudioPlayer({
  soundName,
  filename,
  maxPlayCount = 3,
  engine = audioEngine,
}: AudioPlayerProps) {
  const [playCount, setPlayCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remaining = Math.max(maxPlayCount - playCount, 0);

  const handlePlay = async () => {
    if (isPlaying || remaining <= 0) return;

    setIsPlaying(true);
    setError(null);
    try {
      await engine.playSound(filename);
      setPlayCount((count) => count + 1);
    } catch (err) {
      console.error(err);
      setError("音声の再生に失敗しました");
    } finally {
      setIsPlaying(false);
    }
  };

  const handleStop = () => {
    engine.stopSound();
    setIsPlaying(false);
  };

  return (
    <div className="flex w-full flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
            サンプル試聴
          </p>
          <p className="text-lg font-semibold text-white">{soundName}</p>
        </div>
        <span className="text-sm text-slate-300">
          残り {remaining} / {maxPlayCount} 回
        </span>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handlePlay}
          disabled={remaining <= 0 || isPlaying}
          className={[
            "flex h-20 w-20 items-center justify-center rounded-full text-2xl transition",
            remaining <= 0
              ? "bg-slate-600 text-slate-400"
              : "bg-indigo-500 text-white shadow-[0_10px_30px_rgba(99,102,241,0.4)] hover:bg-indigo-400",
          ].join(" ")}
          aria-label={`${soundName} を再生`}
        >
          {isPlaying ? "⏸" : "▶"}
        </button>
        <div className="flex flex-1 flex-col gap-2">
          <p className="text-sm text-slate-200">
            クリックして音を聞き、自分の耳をウォームアップしましょう。
          </p>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <button
              type="button"
              onClick={handleStop}
              className="rounded-full border border-white/15 px-3 py-1 transition hover:border-indigo-300 hover:text-indigo-200"
            >
              停止
            </button>
            {error && <span className="text-rose-300">{error}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
