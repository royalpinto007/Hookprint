import { expect, test } from "@playwright/test";

test("analyze to result to history flow works", async ({ page }) => {
  await page.goto("/analyze");

  await page.getByRole("button", { name: "Use example" }).click();
  await expect(page.getByRole("textbox", { name: /Transcript or notes/i })).toContainText(
    "POV: you're a wellness creator"
  );

  await page.getByRole("button", { name: "Analyze" }).click();
  await page.waitForURL(/\/result\//);

  await expect(page.getByRole("heading", { name: "Scoring Logic" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Download Card" })).toBeVisible();
  await expect(page.getByText(/This reel is .* hook-driven/)).toBeVisible();

  await page.getByRole("link", { name: "View history" }).click();
  await expect(page).toHaveURL(/\/history$/);
  await expect(page.getByRole("heading", { name: "Burned-out founders" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Clear all" })).toBeVisible();
});
