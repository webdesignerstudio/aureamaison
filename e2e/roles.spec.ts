import { test, expect } from "@playwright/test";
import { captureErrors, assertNoCriticalErrors } from "./debug-helpers";
import { login } from "./test-helpers";

test.describe("Cross-Role Access", () => {
  test.setTimeout(60000);

  test("R1: Legger portal does not crash for owner", async ({ page }) => {
    const errors = captureErrors(page);
    await login(page);
    await page.goto("/legger", { waitUntil: "networkidle" });
    await expect(page.locator("body")).not.toContainText("Application error");
    await expect(page.locator("body")).not.toContainText("500 Internal");
    assertNoCriticalErrors(errors);
  });

  test("R2: Client portal does not crash for owner", async ({ page }) => {
    const errors = captureErrors(page);
    await login(page);
    await page.goto("/client", { waitUntil: "networkidle" });
    await expect(page.locator("body")).not.toContainText("Application error");
    await expect(page.locator("body")).not.toContainText("500 Internal");
    assertNoCriticalErrors(errors);
  });
});
