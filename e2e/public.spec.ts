import { test, expect } from "@playwright/test";
import { captureErrors, assertNoCriticalErrors } from "./debug-helpers";

test.describe("Public Pages", () => {
  test.setTimeout(30000);

  test("P1: Homepage loads", async ({ page }) => {
    const errors = captureErrors(page);
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator("body")).toBeVisible();
    assertNoCriticalErrors(errors);
  });

  test("P2: Homepage shows brand name", async ({ page }) => {
    const errors = captureErrors(page);
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator("body")).toContainText("AUREA MAISON");
    assertNoCriticalErrors(errors);
  });

  test("P3: Offerte page loads and has form", async ({ page }) => {
    const errors = captureErrors(page);
    await page.goto("/offerte", { waitUntil: "networkidle" });
    await expect(page.locator("h1")).toContainText("Offerte aanvragen");
    await expect(page.locator("form")).toBeVisible();
    assertNoCriticalErrors(errors);
  });

  test("P4: Login page loads publicly", async ({ page }) => {
    const errors = captureErrors(page);
    await page.goto("/login", { waitUntil: "networkidle" });
    await expect(page.locator("input[type=email]")).toBeVisible();
    await expect(page.locator("input[type=password]")).toBeVisible();
    assertNoCriticalErrors(errors);
  });
});
