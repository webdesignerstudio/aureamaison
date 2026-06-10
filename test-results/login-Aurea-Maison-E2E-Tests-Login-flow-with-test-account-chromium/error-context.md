# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: login.spec.ts >> Aurea Maison E2E Tests >> Login flow with test account
- Location: e2e/login.spec.ts:8:7

# Error details

```
Test timeout of 60000ms exceeded.
```

```
Error: locator.textContent: Target page, context or browser has been closed
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - alert [ref=e2]
  - generic [ref=e4]:
    - generic [ref=e5]:
      - heading "Aurea Maison Floors" [level=1] [ref=e6]
      - paragraph [ref=e7]: Log in om toegang te krijgen tot het platform
    - generic [ref=e8]:
      - generic [ref=e9]:
        - generic [ref=e10]: E-mailadres
        - textbox "eigenaar@aurea.nl" [ref=e11]
      - generic [ref=e12]:
        - generic [ref=e13]: Wachtwoord
        - textbox "••••••••" [ref=e14]
      - button "Inloggen" [ref=e15]
    - paragraph [ref=e16]: Problemen met inloggen? Neem contact op met de beheerder.
```

# Test source

```ts
  8   |   test("Login flow with test account", async ({ page }) => {
  9   |     const consoleLogs: string[] = [];
  10  |     const errors: string[] = [];
  11  |     const httpErrors: string[] = [];
  12  | 
  13  |     page.on("console", (msg) => {
  14  |       const text = `[${msg.type()}] ${msg.text()}`;
  15  |       consoleLogs.push(text);
  16  |       console.log(text);
  17  |     });
  18  | 
  19  |     page.on("pageerror", (err) => {
  20  |       errors.push(err.message);
  21  |       console.error("[PAGE ERROR]", err.message);
  22  |     });
  23  | 
  24  |     page.on("response", async (response) => {
  25  |       if (response.status() >= 400) {
  26  |         const url = response.url();
  27  |         if (url.includes("supabase") || url.includes("setup-profile")) {
  28  |           const body = await response.text().catch(() => "");
  29  |           const log = `[HTTP ${response.status()}] ${url} | Body: ${body.substring(0, 500)}`;
  30  |           httpErrors.push(log);
  31  |           console.error(log);
  32  |         }
  33  |       }
  34  |     });
  35  | 
  36  |     // 1. Open login page
  37  |     console.log("\n=== STEP 1: Opening login page ===");
  38  |     await page.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
  39  |     await page.waitForLoadState("networkidle");
  40  |     await page.screenshot({ path: "e2e/screenshots/01-login-page.png", fullPage: true });
  41  | 
  42  |     // 2. Wait for form and fill credentials
  43  |     console.log("\n=== STEP 2: Filling credentials ===");
  44  |     await page.waitForSelector("form input", { timeout: 10000 });
  45  | 
  46  |     const inputs = await page.locator("form input").all();
  47  |     console.log("Found inputs:", inputs.length);
  48  | 
  49  |     if (inputs.length >= 2) {
  50  |       await inputs[0].fill("test@test.nl");
  51  |       console.log("Email filled");
  52  |       await inputs[1].fill("test123");
  53  |       console.log("Password filled");
  54  |     } else {
  55  |       // Fallback: try by label
  56  |       await page.getByLabel(/e-mail/i).fill("test@test.nl");
  57  |       await page.getByLabel(/wachtwoord/i).fill("test123");
  58  |     }
  59  | 
  60  |     await page.screenshot({ path: "e2e/screenshots/02-filled-form.png", fullPage: true });
  61  | 
  62  |     // 3. Submit form
  63  |     console.log("\n=== STEP 3: Submitting login ===");
  64  |     await page.click('button[type="submit"]');
  65  |     console.log("Submit clicked");
  66  | 
  67  |     // 4. Wait for result - allow 1s propagation + network time
  68  |     console.log("\n=== STEP 4: Waiting for result (up to 15s) ===");
  69  |     await page.waitForTimeout(8000);
  70  |     await page.screenshot({ path: "e2e/screenshots/03-after-submit.png", fullPage: true });
  71  | 
  72  |     // 5. Check final state
  73  |     const currentUrl = page.url();
  74  |     console.log("\n=== STEP 5: Checking result ===");
  75  |     console.log("Current URL:", currentUrl);
  76  | 
  77  |     const isOnDashboard = currentUrl.includes("/dashboard");
  78  |     const isOnLogin = currentUrl.includes("/login");
  79  | 
  80  |     // Check for error messages
  81  |     const errorText = await page.locator('[class*="bg-red-500"]').textContent().catch(() => "");
  82  |     console.log("Error banner text:", errorText);
  83  | 
  84  |     // Log all captured data
  85  |     console.log("\n=== CONSOLE LOGS ===");
  86  |     consoleLogs.forEach((log) => console.log(log));
  87  | 
  88  |     if (errors.length > 0) {
  89  |       console.log("\n=== PAGE ERRORS ===");
  90  |       errors.forEach((err) => console.error(err));
  91  |     }
  92  | 
  93  |     if (httpErrors.length > 0) {
  94  |       console.log("\n=== HTTP ERRORS ===");
  95  |       httpErrors.forEach((err) => console.error(err));
  96  |     }
  97  | 
  98  |     console.log("\n=== FINAL RESULTS ===");
  99  |     console.log("On Dashboard:", isOnDashboard);
  100 |     console.log("On Login:", isOnLogin);
  101 |     console.log("Has Error:", !!errorText);
  102 |     console.log("Console Logs Count:", consoleLogs.length);
  103 |     console.log("Page Errors Count:", errors.length);
  104 |     console.log("HTTP Errors Count:", httpErrors.length);
  105 | 
  106 |     // For diagnosis, print page content if still on login
  107 |     if (isOnLogin) {
> 108 |       const bodyText = await page.locator("body").textContent();
      |                                                   ^ Error: locator.textContent: Target page, context or browser has been closed
  109 |       console.log("\n=== PAGE BODY TEXT ===");
  110 |       console.log(bodyText?.substring(0, 2000) || "(empty)");
  111 |     }
  112 | 
  113 |     // Assert: we should reach dashboard
  114 |     expect(isOnDashboard, `Expected dashboard but got: ${currentUrl} | Error: ${errorText}`).toBe(true);
  115 |   });
  116 | 
  117 |   test("Auth callback route works", async ({ page }) => {
  118 |     await page.goto(`${BASE_URL}/auth/callback?code=invalid`, { waitUntil: "networkidle" });
  119 |     await page.screenshot({ path: "e2e/screenshots/04-callback-error.png", fullPage: true });
  120 |     const url = page.url();
  121 |     console.log("Callback redirect URL:", url);
  122 |     expect(url).toContain("/login");
  123 |   });
  124 | });
  125 | 
```