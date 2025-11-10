import { test, expect } from "@playwright/test";

test.describe("sound library", () => {
  test("filters sounds by search term", async ({ page }) => {
    await page.goto("/library");
    await page.waitForLoadState("networkidle");
    const search = page.getByPlaceholder("音の名前や説明文で検索");
    await expect(search).toBeVisible({ timeout: 15000 });
    await search.fill("猫");
    const catButton = page.getByRole("button", { name: /猫/ }).first();
    await expect(catButton).toBeVisible({ timeout: 15000 });
  });
});
