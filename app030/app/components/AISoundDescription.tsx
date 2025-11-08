'use client';

import { useState } from "react";

import { geminiService } from "@/lib/geminiService";
import { SoundData } from "@/types";

interface AISoundDescriptionProps {
  sound: SoundData | null;
}

export function AISoundDescription({ sound }: AISoundDescriptionProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [description, setDescription] = useState<string>("");

  if (!sound) {
    return null;
  }

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await geminiService.generateSoundDescription(sound);
      setDescription(result);
    } catch {
      setError("AI説明文の生成に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/50 via-indigo-900/20 to-purple-900/20 p-6 text-slate-100">
      <div className="flex flex-wrap items-center gap-3">
        <h3 className="text-base font-semibold">AI 音声解説</h3>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={isLoading}
          className="rounded-full bg-indigo-500 px-3 py-1 text-xs font-semibold text-white transition hover:bg-indigo-400 disabled:opacity-60"
        >
          {isLoading ? "生成中..." : "説明を生成"}
        </button>
      </div>
      {error && <p className="mt-3 text-sm text-rose-300">{error}</p>}
      {description && (
        <p className="mt-3 whitespace-pre-wrap text-sm text-slate-100">{description}</p>
      )}
      {!description && !error && (
        <p className="mt-3 text-sm text-slate-300">
          「{sound.name}」の音を言葉にしてみましょう。ボタンを押すと Gemini が解説します。
        </p>
      )}
    </section>
  );
}
