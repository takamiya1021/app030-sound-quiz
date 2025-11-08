import {
  AppSettings,
  QUIZ_LENGTH,
  QuizAnswer,
  QuizSession,
  SoundData,
  UserProgress,
} from "@/types";

const PROGRESS_KEY = "app030:progress";
const SETTINGS_KEY = "app030:settings";
const SESSION_KEY = "app030:session";

const getStorage = (): Storage | null => {
  if (typeof window !== "undefined" && window.localStorage) {
    return window.localStorage;
  }

  if (typeof localStorage !== "undefined") {
    return localStorage;
  }

  return null;
};

const safeStringify = (value: unknown): string | null => {
  try {
    return JSON.stringify(value);
  } catch (error) {
    console.warn("Failed to stringify value for storage", error);
    return null;
  }
};

const safeParse = <T>(raw: string | null): T | null => {
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as T;
  } catch (error) {
    console.warn("Failed to parse value from storage", error);
    return null;
  }
};

const reviveSound = (raw: SoundData): SoundData => ({
  ...raw,
  createdAt: raw.createdAt ? new Date(raw.createdAt) : undefined,
});

const reviveSession = (raw: QuizSession): QuizSession => ({
  ...raw,
  sounds: raw.sounds.slice(0, QUIZ_LENGTH).map(reviveSound),
  choices: raw.choices
    .slice(0, QUIZ_LENGTH)
    .map((choiceSet) => choiceSet.slice(0, 4)),
  choiceSoundIds: raw.choiceSoundIds
    .slice(0, QUIZ_LENGTH)
    .map((choiceSet) => choiceSet.slice(0, 4)),
  startedAt: new Date(raw.startedAt),
  completedAt: raw.completedAt ? new Date(raw.completedAt) : undefined,
  answers: raw.answers.slice(0, QUIZ_LENGTH) as QuizAnswer[],
  correctAnswers: raw.correctAnswers.slice(0, QUIZ_LENGTH),
  playCount: raw.playCount.slice(0, QUIZ_LENGTH),
});

const write = (key: string, value: unknown) => {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  const serialized = safeStringify(value);
  if (!serialized) {
    return;
  }

  storage.setItem(key, serialized);
};

const read = <T>(key: string): T | null => {
  const storage = getStorage();
  if (!storage) {
    return null;
  }

  return safeParse<T>(storage.getItem(key));
};

export const saveProgress = (progress: UserProgress) => write(PROGRESS_KEY, progress);

export const loadProgress = (): UserProgress | null => read<UserProgress>(PROGRESS_KEY);

export const saveSettings = (settings: AppSettings) => write(SETTINGS_KEY, settings);

export const loadSettings = (): AppSettings | null => read<AppSettings>(SETTINGS_KEY);

export const saveSession = (session: QuizSession) => write(SESSION_KEY, session);

export const loadSession = (): QuizSession | null => {
  const raw = read<QuizSession>(SESSION_KEY);
  if (!raw) {
    return null;
  }

  return reviveSession(raw);
};

export const clearStoredSession = () => {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  storage.removeItem(SESSION_KEY);
};
