import { test, expect } from "@playwright/test";
import { captureErrors, assertNoCriticalErrors, assertNoSupabaseErrors, printErrorSummary } from "./debug-helpers";
import { login, navigateTo } from "./test-helpers";

test.describe("Dashboard", () => {
  test.setTimeout(60000);

  test("D1: Dashboard loads KPI cards after login", async ({ page }) => {
    const errors = captureErrors(page);
    await login(page);

    await expect(page.locator("h1")).toContainText("Dashboard");
    await expect(page.locator("body")).toContainText("Totaal orders");
    await expect(page.locator("body")).toContainText("Omzet");
    await expect(page.locator("body")).toContainText("Open offertes");
    await expect(page.locator("body")).toContainText("Actieve leggers");

    assertNoCriticalErrors(errors);
    assertNoSupabaseErrors(errors);
  });

  test("D2: Navigation links work for all dashboard sections", async ({ page }) => {
    const errors = captureErrors(page);
    await login(page);

    const sections = [
      { label: "Orders", path: /\/dashboard\/orders/ },
      { label: "Offertes", path: /\/dashboard\/offertes/ },
      { label: "Leggers", path: /\/dashboard\/leggers/ },
      { label: "Klanten", path: /\/dashboard\/klanten/ },
      { label: "Instellingen", path: /\/dashboard\/settings/ },
    ];

    for (const { label, path } of sections) {
      await navigateTo(page, label, path);
      await expect(page.locator("body")).not.toContainText("Application error");
      await expect(page.locator("body")).not.toContainText("500 Internal");
    }

    assertNoCriticalErrors(errors);
    assertNoSupabaseErrors(errors);
  });

  test("D3: Dashboard nav shows correct items for owner role", async ({ page }) => {
    const errors = captureErrors(page);
    await login(page);

    const expectedItems = ["Dashboard", "Orders", "Offertes", "Leggers", "Klanten", "Instellingen"];
    for (const label of expectedItems) {
      await expect(page.getByRole("link", { name: label }).first()).toBeVisible();
    }

    assertNoCriticalErrors(errors);
  });
});
