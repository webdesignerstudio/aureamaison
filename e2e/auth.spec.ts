import { test, expect } from "@playwright/test";
import { captureErrors, assertNoCriticalErrors, assertNoSupabaseErrors } from "./debug-helpers";
import { CREDENTIALS } from "./test-helpers";

test.describe("Auth", () => {
  test.setTimeout(60000);

  test("A1: Login page loads with email and password fields", async ({ page }) => {
    const errors = captureErrors(page);
    await page.goto("/login", { waitUntil: "networkidle" });
    await expect(page.getByPlaceholder("eigenaar@aurea.nl")).toBeVisible();
    await expect(page.getByPlaceholder("••••••••")).toBeVisible();
    await expect(page.getByRole("button", { name: /inloggen/i })).toBeVisible();
    assertNoCriticalErrors(errors);
  });

  test("A2: Valid credentials redirect to dashboard", async ({ page }) => {
    const errors = captureErrors(page);
    await page.goto("/login", { waitUntil: "networkidle" });
    await page.getByPlaceholder("eigenaar@aurea.nl").fill(CREDENTIALS.email);
    await page.getByPlaceholder("••••••••").fill(CREDENTIALS.password);
    await page.getByRole("button", { name: /inloggen/i }).click();
    await page.waitForURL(/\/dashboard/, { timeout: 30000 });
    await expect(page.locator("h1")).toContainText("Dashboard");
    assertNoCriticalErrors(errors);
    assertNoSupabaseErrors(errors);
  });

  test("A3: Invalid credentials show error", async ({ page }) => {
    const errors = captureErrors(page);
    await page.goto("/login", { waitUntil: "networkidle" });
    await page.getByPlaceholder("eigenaar@aurea.nl").fill("wrong@email.nl");
    await page.getByPlaceholder("••••••••").fill("wrongpassword");
    await page.getByRole("button", { name: /inloggen/i }).click();
    await expect(page.locator("body")).toContainText("Ongeldige inloggegevens");
    assertNoCriticalErrors(errors);
  });

  test("A4: Logout redirects to login", async ({ page }) => {
    const errors = captureErrors(page);
    await page.goto("/login", { waitUntil: "networkidle" });
    await page.getByPlaceholder("eigenaar@aurea.nl").fill(CREDENTIALS.email);
    await page.getByPlaceholder("••••••••").fill(CREDENTIALS.password);
    await page.getByRole("button", { name: /inloggen/i }).click();
    await page.waitForURL(/\/dashboard/, { timeout: 30000 });

    const logoutBtn = page.getByRole("button", { name: /uitloggen/i }).first();
    await expect(logoutBtn).toBeVisible();
    await logoutBtn.click();
    await page.waitForURL(/\/login/, { timeout: 10000 });
    assertNoCriticalErrors(errors);
  });

  test("A5: Unauthenticated access to dashboard redirects to login", async ({ page }) => {
    const errors = captureErrors(page);
    await page.goto("/dashboard", { waitUntil: "networkidle" });
    await expect(page).toHaveURL(/\/login/);
    assertNoCriticalErrors(errors);
  });

  test("A6: Auth callback with invalid code redirects to login", async ({ page }) => {
    const errors = captureErrors(page);
    await page.goto("/auth/callback?code=invalid", { waitUntil: "networkidle" });
    await expect(page).toHaveURL(/\/login/);
    assertNoCriticalErrors(errors);
  });
});
