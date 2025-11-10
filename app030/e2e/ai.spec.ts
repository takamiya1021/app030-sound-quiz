import { test, expect } from "@playwright/test";

test.describe("AI helpers", () => {
  test("generates fallback AI descriptions", async ({ page }) => {
    await page.goto("/library");
    await page.waitForLoadState("networkidle");
    const search = page.getByPlaceholder("音の名前や説明文で検索");
    await expect(search).toBeVisible({ timeout: 15000 });
    await search.fill("猫");
    const firstSoundButton = page.getByRole("button", { name: /猫/ }).first();
    await expect(firstSoundButton).toBeVisible({ timeout: 15000 });
    await firstSoundButton.click();

    const generateButton = page.getByRole("button", { name: "説明を生成" });
    await generateButton.click();
    await expect(page.getByText(/耳を澄ませて/i)).toBeVisible();
  });
});
