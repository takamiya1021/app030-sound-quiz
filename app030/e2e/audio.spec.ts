import { test, expect } from "@playwright/test";

test.describe("audio handling", () => {
  test("disables playback gracefully when Web Audio is unavailable", async ({ page }) => {
    await page.addInitScript(() => {
      // eslint-disable-next-line no-undef
      delete (window as any).AudioContext;
      // eslint-disable-next-line no-undef
      delete (window as any).webkitAudioContext;
    });

    await page.goto("/quiz?category=%E6%A5%BD%E5%99%A8%E3%81%AE%E9%9F%B3&difficulty=beginner");
    await page.waitForLoadState("networkidle");
    await expect(page.getByText(/サンプル試聴/)).toBeVisible({ timeout: 15000 });
    const button = page.getByRole("button", { name: /を再生/ }).first();
    await expect(button).toBeDisabled();
    await expect(page.getByText(/サポートされていません/)).toBeVisible();
  });
});
