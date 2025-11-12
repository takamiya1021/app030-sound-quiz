import { GeminiService } from "@/lib/geminiService";

type MockFetchResponse = {
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
};

type MockFetch = jest.Mock<Promise<MockFetchResponse>, [RequestInfo | URL, RequestInit?]>;

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
    const fetchImpl: MockFetch = jest.fn(async () => ({
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
    }));

    const service = new GeminiService({ fetchImpl, apiKey: "test-key" });
    await expect(service.generateSoundDescription(mockSound)).resolves.toBe("テスト応答");
  });

  it("falls back when API returns error", async () => {
    const fetchImpl: MockFetch = jest.fn(async () => ({
      ok: false,
      status: 500,
      json: async () => ({}),
    }));

    const service = new GeminiService({ fetchImpl, apiKey: "test-key" });
    await expect(service.generateSoundDescription(mockSound)).resolves.toMatch(/ピアノ/);
  });

  it("parses listening tips JSON", async () => {
    const fetchImpl: MockFetch = jest.fn(async () => ({
      ok: true,
      json: async () => ({
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify({
                    differences: ["diff"],
                    focusPoints: ["focus"],
                    tips: ["tip"],
                  }),
                },
              ],
            },
          },
        ],
      }),
    }));

    const service = new GeminiService({ fetchImpl, apiKey: "key" });
    await expect(
      service.generateListeningTips(mockSound, { ...mockSound, name: "ギター" }),
    ).resolves.toEqual({
      differences: ["diff"],
      focusPoints: ["focus"],
      tips: ["tip"],
    });
  });

  it("returns fallback study plan when JSON invalid", async () => {
    const fetchImpl: MockFetch = jest.fn(async () => ({
      ok: true,
      json: async () => ({
        candidates: [
          {
            content: {
              parts: [{ text: "not json" }],
            },
          },
        ],
      }),
    }));

    const service = new GeminiService({ fetchImpl, apiKey: "key" });
    await expect(
      service.suggestStudyPlan({ categoryStats: { "楽器の音": { correct: 5, total: 10 } } }),
    ).resolves.toHaveProperty("practiceSchedule");
  });
});
