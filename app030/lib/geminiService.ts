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

export class GeminiService {
  private readonly fetchImpl: FetchLike | null;

  private readonly apiKey: string | undefined;

  constructor(options: GeminiServiceOptions = {}) {
    this.fetchImpl = options.fetchImpl ?? (typeof fetch === "function" ? fetch.bind(globalThis) : null);
    this.apiKey = options.apiKey ?? process.env.GEMINI_API_KEY ?? process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  }

  public async generateSoundDescription(sound: {
    name: string;
    category: string;
    description: string;
  }): Promise<string> {
    if (!this.apiKey || !this.fetchImpl) {
      return FALLBACK_RESPONSE(sound.name, sound.description);
    }

    const prompt = `${DEFAULT_PROMPT_HEADER}

名前: ${sound.name}
カテゴリー: ${sound.category}
説明: ${sound.description}

フォーマット:
- 音の印象
- 聞き分けのポイント
- 活用シーン`;

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
      return text?.trim() || FALLBACK_RESPONSE(sound.name, sound.description);
    } catch (error) {
      console.warn("Gemini service fallback due to error:", error);
      return FALLBACK_RESPONSE(sound.name, sound.description);
    }
  }
}

export const geminiService = new GeminiService();
