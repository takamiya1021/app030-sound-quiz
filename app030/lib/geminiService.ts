type FetchLike = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

interface GeminiServiceOptions {
  apiKey?: string;
  fetchImpl?: FetchLike | null;
}

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
}

const DEFAULT_PROMPT_HEADER = `あなたは音の特徴をわかりやすく説明する解説者です。以下の音について、初心者向けに短く魅力的な解説を書いてください。`;

const FALLBACK_RESPONSE = (soundName: string, description: string) =>
  `${soundName} は ${description} という特徴を持っています。耳を澄ませて、この音だけが持つ質感と表情を探ってみましょう。`;

const FALLBACK_TIPS = {
  differences: [
    "リズムや音量の揺らぎに注目して違いを探ってみましょう。",
  ],
  focusPoints: [
    "アタック（鳴り始め）と余韻の長さを聞き比べてください。",
  ],
  tips: [
    "片耳ずつ交互に聴くと微妙な質感の差が掴みやすくなります。",
  ],
};

const FALLBACK_PLAN = {
  weakCategories: ["楽器の音"],
  recommendedOrder: ["楽器の音", "動物の鳴き声", "日常の音"],
  practiceSchedule: [
    "1日目: 楽器の音（初級）を10問",
    "2日目: 楽器の音（中級）で耳慣らし",
    "3日目: 苦手な音を復習しながらランダム出題",
  ],
};

export class GeminiService {
  private readonly fetchImpl: FetchLike | null;

  private readonly apiKey: string | undefined;

  constructor(options: GeminiServiceOptions = {}) {
    this.fetchImpl = options.fetchImpl ?? (typeof fetch === "function" ? fetch.bind(globalThis) : null);
    this.apiKey = options.apiKey
      ?? (typeof window !== 'undefined'
          ? localStorage.getItem('gemini_api_key') ?? undefined
          : undefined)
      ?? process.env.GEMINI_API_KEY
      ?? process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  }

  private async callModel(prompt: string): Promise<string | null> {
    if (!this.apiKey || !this.fetchImpl) {
      return null;
    }

    try {
      const response = await this.fetchImpl(
        `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${this.apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: prompt }],
              },
            ],
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`Gemini API error ${response.status}`);
      }

      const data = (await response.json()) as GeminiResponse;
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      return text?.trim() ?? null;
    } catch (error) {
      console.warn("Gemini service fallback due to error:", error);
      return null;
    }
  }

  public async generateSoundDescription(sound: {
    name: string;
    category: string;
    description: string;
  }): Promise<string> {
    const prompt = `${DEFAULT_PROMPT_HEADER}

名前: ${sound.name}
カテゴリー: ${sound.category}
説明: ${sound.description}

フォーマット:
- 音の印象
- 聞き分けのポイント
- 活用シーン`;

    const text = await this.callModel(prompt);
    return text ?? FALLBACK_RESPONSE(sound.name, sound.description);
  }

  public async generateListeningTips(soundA: SoundDataLike, soundB: SoundDataLike) {
    const prompt = `あなたは音感トレーナーです。以下2つの音の違いと聞き分け方を初心者向けに説明してください。出力は JSON のみで、以下の形式にしてください:
{
  "differences": ["..."],
  "focusPoints": ["..."],
  "tips": ["..."]
}

音1: ${soundA.name} (${soundA.category}) - ${soundA.description}
音2: ${soundB.name} (${soundB.category}) - ${soundB.description}`;

    const text = await this.callModel(prompt);
    if (!text) {
      return FALLBACK_TIPS;
    }

    try {
      const parsed = JSON.parse(text) as typeof FALLBACK_TIPS;
      if (
        Array.isArray(parsed.differences) &&
        Array.isArray(parsed.focusPoints) &&
        Array.isArray(parsed.tips)
      ) {
        return parsed;
      }
      return FALLBACK_TIPS;
    } catch {
      return FALLBACK_TIPS;
    }
  }

  public async suggestStudyPlan(progress: {
    categoryStats: Record<string, { correct: number; total: number }>;
  }) {
    const statsText = Object.entries(progress.categoryStats)
      .map(
        ([category, stat]) =>
          `${category}: 正解 ${stat.correct} / ${stat.total} (${stat.total ? Math.round((stat.correct / stat.total) * 100) : 0}%)`,
      )
      .join("\n");

    const prompt = `あなたは音感トレーニングコーチです。以下の学習履歴に基づき、苦手カテゴリ・おすすめ学習順・3日間の学習プランをJSONで出力してください。
出力例:
{
  "weakCategories": ["..."],
  "recommendedOrder": ["..."],
  "practiceSchedule": ["..."]
}

学習履歴:
${statsText || "記録なし"}`;

    const text = await this.callModel(prompt);
    if (!text) {
      return FALLBACK_PLAN;
    }

    try {
      const parsed = JSON.parse(text) as typeof FALLBACK_PLAN;
      if (
        Array.isArray(parsed.weakCategories) &&
        Array.isArray(parsed.recommendedOrder) &&
        Array.isArray(parsed.practiceSchedule)
      ) {
        return parsed;
      }
      return FALLBACK_PLAN;
    } catch {
      return FALLBACK_PLAN;
    }
  }
}

export const geminiService = new GeminiService();

interface SoundDataLike {
  name: string;
  category: string;
  description: string;
}
