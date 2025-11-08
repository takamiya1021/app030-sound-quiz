import { GeminiService } from "@/lib/geminiService";

const mockSound = {
  name: "ピアノ",
  category: "楽器の音",
  description: "柔らかく澄んだ鍵盤の響き",
};

describe("GeminiService", () => {
  it("returns fallback when api key is missing", async () => {
    const service = new GeminiService({ fetchImpl: null });
    await expect(service.generateSoundDescription(mockSound)).resolves.toMatch(/ピアノ/);
  });

  it("returns formatted response when API succeeds", async () => {
    const fetchImpl = jest.fn(async () => ({
      ok: true,
      json: async () => ({
        candidates: [
          {
            content: {
              parts: [{ text: "テスト応答" }],
            },
          },
        ],
      }),
    })) as any;

    const service = new GeminiService({ fetchImpl, apiKey: "test-key" });
    await expect(service.generateSoundDescription(mockSound)).resolves.toBe("テスト応答");
  });

  it("falls back when API returns error", async () => {
    const fetchImpl = jest.fn(async () => ({
      ok: false,
      status: 500,
      json: async () => ({}),
    })) as any;

    const service = new GeminiService({ fetchImpl, apiKey: "test-key" });
    await expect(service.generateSoundDescription(mockSound)).resolves.toMatch(/ピアノ/);
  });
});
