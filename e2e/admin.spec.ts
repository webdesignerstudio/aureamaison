import { test, expect } from "@playwright/test";
import { captureErrors, assertNoCriticalErrors, assertNoSupabaseErrors } from "./debug-helpers";
import { login } from "./test-helpers";

test.describe("Admin / Superadmin", () => {
  test.setTimeout(60000);

  test("AD1: Admin page does not show admin content for owner", async ({ page }) => {
    const errors = captureErrors(page);
    await login(page);
    await page.goto("/admin", { waitUntil: "networkidle" });

    // Owner should not see "Superadmin" heading (page is empty or redirected)
    await expect(page.locator("body")).not.toContainText("Superadmin");
    assertNoCriticalErrors(errors);
  });

  test("AD2: Admin page does not crash for owner", async ({ page }) => {
    const errors = captureErrors(page);
    await login(page);
    await page.goto("/admin", { waitUntil: "networkidle" });

    // Should not show 500 or infinite recursion
    await expect(page.locator("body")).not.toContainText("infinite recursion");
    await expect(page.locator("body")).not.toContainText("500 Internal");
    assertNoCriticalErrors(errors);
  });
});
