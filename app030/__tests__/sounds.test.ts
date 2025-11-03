import fs from "fs";
import path from "path";

import sounds from "@/data/sounds";
import { DIFFICULTY_LEVELS, SoundData } from "@/types";

const CATEGORY_SET = new Set([
  "楽器の音",
  "動物の鳴き声",
  "日常の音",
  "自然の音",
  "効果音",
]);

describe("sound bank metadata", () => {
  const soundArray = sounds as SoundData[];

  it("contains at least 50 sound entries", () => {
    expect(soundArray.length).toBeGreaterThanOrEqual(50);
  });

  it("uses unique identifiers and valid categories", () => {
    const ids = new Set(soundArray.map((sound) => sound.id));
    expect(ids.size).toBe(soundArray.length);

    soundArray.forEach((sound) => {
      expect(CATEGORY_SET.has(sound.category)).toBe(true);
      expect(DIFFICULTY_LEVELS.includes(sound.difficulty)).toBe(true);
      expect(sound.description.trim().length).toBeGreaterThan(0);
    });
  });

  it("references existing audio assets under public/sounds", () => {
    const baseDir = path.join(process.cwd(), "public", "sounds");

    soundArray.forEach((sound) => {
      const filePath = path.join(baseDir, sound.filename);
      expect(fs.existsSync(filePath)).toBe(true);
    });
  });
});
