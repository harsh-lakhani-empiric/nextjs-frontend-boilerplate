import { test, expect } from "@playwright/test";

test("homepage loads and title template applies on a nested route", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("Home");

  await page.goto("/about");
  await expect(page).toHaveTitle("About | App Name");
});
