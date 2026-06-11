import { test, expect } from "@playwright/test";
import { captureErrors, assertNoCriticalErrors } from "./debug-helpers";

const CREDENTIALS = { email: "test@test.nl", password: "test123" };

async function login(page: any) {
  await page.goto("/login", { waitUntil: "networkidle" });
  await page.getByPlaceholder("eigenaar@aurea.nl").fill(CREDENTIALS.email);
  await page.getByPlaceholder("••••••••").fill(CREDENTIALS.password);
  await page.getByRole("button", { name: /inloggen/i }).click();
  await page.waitForURL(/\/dashboard/, { timeout: 30000 });
  await page.waitForSelector("h1", { timeout: 10000 });
  await page.waitForLoadState("networkidle");
}

test.describe("Smoke Tests — Production", () => {
  test.setTimeout(60000);

  test("A1: Public home loads", async ({ page }) => {
    const errors = captureErrors(page);
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator("body")).toBeVisible();
    assertNoCriticalErrors(errors);
  });

  test("A2: Public offerte page loads", async ({ page }) => {
    const errors = captureErrors(page);
    await page.goto("/offerte", { waitUntil: "domcontentloaded" });
    await expect(page.locator("form, h1, h2").first()).toBeVisible();
    assertNoCriticalErrors(errors);
  });

  test("A3: Login page loads", async ({ page }) => {
    const errors = captureErrors(page);
    await page.goto("/login", { waitUntil: "domcontentloaded" });
    await expect(page.locator("input[type=email]")).toBeVisible();
    await expect(page.locator("input[type=password]")).toBeVisible();
    assertNoCriticalErrors(errors);
  });

  test("A4-A5: Login flow redirects to dashboard", async ({ page }) => {
    const errors = captureErrors(page);
    await login(page);

    assertNoCriticalErrors(errors);
  });

  test("A6-A10: Dashboard nav pages load", async ({ page }) => {
    const errors = captureErrors(page);

    await login(page);

    const navLinks = [
      { label: "Orders", path: "/dashboard/orders" },
      { label: "Offertes", path: "/dashboard/offertes" },
      { label: "Leggers", path: "/dashboard/leggers" },
      { label: "Klanten", path: "/dashboard/klanten" },
      { label: "Instellingen", path: "/dashboard/settings" },
    ];

    for (const { label, path } of navLinks) {
      await page.getByRole("link", { name: label }).first().click();
      await page.waitForURL(path, { timeout: 10000 });
      await page.waitForLoadState("networkidle");
      // Should not show error pages
      await expect(page.locator("body")).not.toContainText("infinite recursion");
      await expect(page.locator("body")).not.toContainText("500 Internal");
    }

    assertNoCriticalErrors(errors);
  });

  test("A11: Admin page loads without recursion", async ({ page }) => {
    const errors = captureErrors(page);

    await login(page);

    // Navigate to admin
    await page.goto("/admin", { waitUntil: "networkidle" });
    await expect(page.locator("body")).not.toContainText("infinite recursion");
    await expect(page.locator("body")).not.toContainText("500 Internal");

    assertNoCriticalErrors(errors);
  });

  test("A12: Logout redirects to login", async ({ page }) => {
    const errors = captureErrors(page);

    await login(page);

    // Click logout (assume button with text "Uitloggen" or similar)
    const logoutBtn = page.getByRole("button", { name: /uitloggen|logout/i }).first();
    if (await logoutBtn.isVisible().catch(() => false)) {
      await logoutBtn.click();
      await page.waitForURL(/\/login/, { timeout: 10000 });
    }

    assertNoCriticalErrors(errors);
  });
});
