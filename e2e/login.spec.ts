import { test, expect } from "@playwright/test";

const BASE_URL = "https://www.aureamaisonfloors.nl";

test.describe("Aurea Maison E2E Tests", () => {
  test.setTimeout(90000);

  test("Login flow with test account", async ({ browser }) => {
    // Create fresh incognito context
    const context = await browser.newContext();
    const page = await context.newPage();
    const consoleLogs: string[] = [];
    const errors: string[] = [];
    const httpErrors: string[] = [];

    page.on("console", (msg) => {
      const text = `[${msg.type()}] ${msg.text()}`;
      consoleLogs.push(text);
      console.log(text);
    });

    page.on("pageerror", (err) => {
      errors.push(err.message);
      console.error("[PAGE ERROR]", err.message);
    });

    page.on("response", async (response) => {
      if (response.status() >= 400) {
        const url = response.url();
        if (url.includes("supabase") || url.includes("setup-profile")) {
          const body = await response.text().catch(() => "");
          const log = `[HTTP ${response.status()}] ${url} | Body: ${body.substring(0, 500)}`;
          httpErrors.push(log);
          console.error(log);
        }
      }
    });

    // 1. Open login page
    await page.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
    await page.waitForSelector('button[type="submit"]', { timeout: 10000 });
    await page.screenshot({ path: "e2e/screenshots/01-login-page.png", fullPage: true });

    // 2. Fill credentials
    const inputs = await page.locator("form input").all();
    await inputs[0].fill("test@test.nl");
    await inputs[1].fill("test123");
    await page.screenshot({ path: "e2e/screenshots/02-filled-form.png", fullPage: true });

    // 3. Submit and wait for dashboard
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 30000 });
    // Wait for dashboard content to fully render
    await page.waitForSelector("h1", { timeout: 10000 });
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: "e2e/screenshots/03-dashboard.png", fullPage: true });

    // 4. Log results
    const currentUrl = page.url();
    console.log("\n=== FINAL RESULTS ===");
    console.log("Current URL:", currentUrl);
    consoleLogs.forEach((log) => console.log(log));
    httpErrors.forEach((err) => console.error(err));

    // Assert: on dashboard
    expect(currentUrl).toContain("/dashboard");
  });

  test("Auth callback route works", async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/callback?code=invalid`, { waitUntil: "networkidle" });
    await page.screenshot({ path: "e2e/screenshots/04-callback-error.png", fullPage: true });
    const url = page.url();
    console.log("Callback redirect URL:", url);
    expect(url).toContain("/login");
  });
});
