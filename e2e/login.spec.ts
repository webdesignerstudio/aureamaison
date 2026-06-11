import { test, expect } from "@playwright/test";

const BASE_URL = "https://www.aureamaisonfloors.nl";

test.describe("Aurea Maison E2E Tests", () => {
  test.setTimeout(60000);

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
    console.log("\n=== STEP 1: Opening login page ===");
    await page.context().clearCookies();
    await page.setExtraHTTPHeaders({ "Cache-Control": "no-cache", "Pragma": "no-cache" });
    await page.goto(`${BASE_URL}/login?cb=${Date.now()}`, { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: "e2e/screenshots/01-login-page.png", fullPage: true });

    // 2. Wait for form and fill credentials
    console.log("\n=== STEP 2: Filling credentials ===");
    await page.waitForSelector("form input", { timeout: 10000 });

    const inputs = await page.locator("form input").all();
    console.log("Found inputs:", inputs.length);

    if (inputs.length >= 2) {
      await inputs[0].fill("test@test.nl");
      console.log("Email filled");
      await inputs[1].fill("test123");
      console.log("Password filled");
    } else {
      // Fallback: try by label
      await page.getByLabel(/e-mail/i).fill("test@test.nl");
      await page.getByLabel(/wachtwoord/i).fill("test123");
    }

    await page.screenshot({ path: "e2e/screenshots/02-filled-form.png", fullPage: true });

    // 3. Submit form
    console.log("\n=== STEP 3: Submitting login ===");
    await page.click('button[type="submit"]');
    console.log("Submit clicked");

    // 4. Wait for result - allow 1s propagation + network time
    console.log("\n=== STEP 4: Waiting for result ===");
    await page.waitForTimeout(4000);
    await page.screenshot({ path: "e2e/screenshots/03-after-submit.png", fullPage: true });

    // Debug: log storage
    const storageData = await page.evaluate(() => {
      const data: Record<string, string> = {};
      const ls = window.localStorage;
      for (let i = 0; i < ls.length; i++) {
        const key = ls.key(i);
        if (key) data[key] = ls.getItem(key) || "";
      }
      return data;
    });
    console.log("\n=== LOCAL STORAGE ===");
    Object.entries(storageData).forEach(([k, v]) => {
      if (k.includes("supabase") || k.includes("auth")) {
        console.log(`${k}: ${v.substring(0, 200)}...`);
      }
    });

    // 5. Check final state
    const currentUrl = page.url();
    console.log("\n=== STEP 5: Checking result ===");
    console.log("Current URL:", currentUrl);

    const isOnDashboard = currentUrl.includes("/dashboard");
    const isOnLogin = currentUrl.includes("/login");

    // Check for error messages
    const errorText = await page.locator('[class*="bg-red-500"]').textContent().catch(() => "");
    console.log("Error banner text:", errorText);

    // Log all captured data
    console.log("\n=== CONSOLE LOGS ===");
    consoleLogs.forEach((log) => console.log(log));

    if (errors.length > 0) {
      console.log("\n=== PAGE ERRORS ===");
      errors.forEach((err) => console.error(err));
    }

    if (httpErrors.length > 0) {
      console.log("\n=== HTTP ERRORS ===");
      httpErrors.forEach((err) => console.error(err));
    }

    console.log("\n=== FINAL RESULTS ===");
    console.log("On Dashboard:", isOnDashboard);
    console.log("On Login:", isOnLogin);
    console.log("Has Error:", !!errorText);
    console.log("Console Logs Count:", consoleLogs.length);
    console.log("Page Errors Count:", errors.length);
    console.log("HTTP Errors Count:", httpErrors.length);

    // Assert: we should reach dashboard
    expect(isOnDashboard, `Expected dashboard but got: ${currentUrl}`).toBe(true);
  });

  test("Auth callback route works", async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/callback?code=invalid`, { waitUntil: "networkidle" });
    await page.screenshot({ path: "e2e/screenshots/04-callback-error.png", fullPage: true });
    const url = page.url();
    console.log("Callback redirect URL:", url);
    expect(url).toContain("/login");
  });
});
