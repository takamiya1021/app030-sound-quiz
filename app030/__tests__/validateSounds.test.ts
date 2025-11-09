import { collectSoundValidationErrors } from "@/lib/validateSounds.server";

describe("collectSoundValidationErrors", () => {
  it("returns no errors for valid dataset", () => {
    const errors = collectSoundValidationErrors({
      existsSync: () => true,
    });
    expect(errors).toEqual([]);
  });

  it("detects missing files", () => {
    const errors = collectSoundValidationErrors({
      existsSync: () => false,
    });
    expect(errors.some((error) => error.includes("Missing audio file"))).toBe(true);
  });
});
