import fs from "fs";
import path from "path";

import sounds from "@/data/sounds";

type FsLike = {
  existsSync: (path: string) => boolean;
};

const DEFAULT_CATEGORIES = new Set(
  sounds.map((sound) => sound.category),
);

const shouldSkip = () =>
  process.env.SKIP_SOUND_VALIDATION === "1" || process.env.NODE_ENV === "test";

export function collectSoundValidationErrors(fsModule: FsLike = fs): string[] {
  const checker = fsModule;

  const errors: string[] = [];
  const ids = new Set<string>();

  sounds.forEach((sound) => {
    if (!sound.id) {
      errors.push("Sound id is missing");
    } else if (ids.has(sound.id)) {
      errors.push(`Duplicate sound id detected: ${sound.id}`);
    } else {
      ids.add(sound.id);
    }

    if (!sound.name?.trim()) {
      errors.push(`Sound name is empty for id ${sound.id}`);
    }

    if (!sound.description?.trim()) {
      errors.push(`Sound description is empty for id ${sound.id}`);
    }

    if (!DEFAULT_CATEGORIES.has(sound.category)) {
      errors.push(`Unknown category ${sound.category} for id ${sound.id}`);
    }

    const normalizedFilename = sound.filename.replace(/^\/+/, "");
    const filePath = path.join(process.cwd(), "public", "sounds", normalizedFilename);
    if (!checker.existsSync(filePath)) {
      errors.push(`Missing audio file: ${sound.filename}`);
    }
  });

  return errors;
}

export function validateSoundsOnServer(): void {
  if (typeof window !== "undefined" || shouldSkip()) {
    return;
  }

  const errors = collectSoundValidationErrors();
  if (errors.length) {
    console.warn(
      `Sound metadata issues detected:\n${errors.map((err) => ` • ${err}`).join("\n")}`,
    );
  }
}
