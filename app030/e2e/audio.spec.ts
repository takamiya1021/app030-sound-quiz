import { test, expect } from "@playwright/test";

const disableWebAudio = () => {
  const target = window as Window & {
    AudioContext?: typeof AudioContext;
    webkitAudioContext?: typeof AudioContext;
  };
  delete target.AudioContext;
  delete target.webkitAudioContext;
};

test.describe("audio handling", () => {
  test("disables playback gracefully when Web Audio is unavailable", async ({ page }) => {
    await page.addInitScript(disableWebAudio);

    await page.goto("/quiz?category=%E6%A5%BD%E5%99%A8%E3%81%AE%E9%9F%B3&difficulty=beginner");
    await page.waitForLoadState("networkidle");
    const button = page.getByRole("button", { name: /を再生/ }).first();
    await expect(button).toBeVisible({ timeout: 15000 });
    await expect(button).toBeDisabled();
    await expect(page.getByText(/サポートされていません/)).toBeVisible();
  });
});
