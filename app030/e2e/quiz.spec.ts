import { test, expect } from "@playwright/test";

test.describe("quiz flow", () => {
  test("user can answer a full quiz and see results", async ({ page }) => {
    await page.goto("/quiz?category=%E6%A5%BD%E5%99%A8%E3%81%AE%E9%9F%B3&difficulty=beginner");
    await page.waitForLoadState("networkidle");
    const choiceButton = page.getByTestId("choice-button").first();
    await expect(choiceButton).toBeVisible({ timeout: 15000 });

    for (let i = 0; i < 10; i += 1) {
      await choiceButton.click();
    }

    await expect(page.getByText(/もう一度挑戦/)).toBeVisible();
  });
});
