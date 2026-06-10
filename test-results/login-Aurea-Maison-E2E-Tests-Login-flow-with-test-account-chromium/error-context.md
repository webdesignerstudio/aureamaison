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
Error: Expected dashboard but got: https://www.aureamaisonfloors.nl/login?cb=1781131817289

expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
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
  38  |     await page.context().clearCookies();
  39  |     await page.goto(`${BASE_URL}/login?cb=${Date.now()}`, { waitUntil: "domcontentloaded" });
  40  |     await page.waitForLoadState("networkidle");
  41  |     await page.screenshot({ path: "e2e/screenshots/01-login-page.png", fullPage: true });
  42  | 
  43  |     // 2. Wait for form and fill credentials
  44  |     console.log("\n=== STEP 2: Filling credentials ===");
  45  |     await page.waitForSelector("form input", { timeout: 10000 });
  46  | 
  47  |     const inputs = await page.locator("form input").all();
  48  |     console.log("Found inputs:", inputs.length);
  49  | 
  50  |     if (inputs.length >= 2) {
  51  |       await inputs[0].fill("test@test.nl");
  52  |       console.log("Email filled");
  53  |       await inputs[1].fill("test123");
  54  |       console.log("Password filled");
  55  |     } else {
  56  |       // Fallback: try by label
  57  |       await page.getByLabel(/e-mail/i).fill("test@test.nl");
  58  |       await page.getByLabel(/wachtwoord/i).fill("test123");
  59  |     }
  60  | 
  61  |     await page.screenshot({ path: "e2e/screenshots/02-filled-form.png", fullPage: true });
  62  | 
  63  |     // 3. Submit form
  64  |     console.log("\n=== STEP 3: Submitting login ===");
  65  |     await page.click('button[type="submit"]');
  66  |     console.log("Submit clicked");
  67  | 
  68  |     // 4. Wait for result - allow 1s propagation + network time
  69  |     console.log("\n=== STEP 4: Waiting for result ===");
  70  |     await page.waitForTimeout(4000);
  71  |     await page.screenshot({ path: "e2e/screenshots/03-after-submit.png", fullPage: true });
  72  | 
  73  |     // Debug: log storage
  74  |     const storageData = await page.evaluate(() => {
  75  |       const data: Record<string, string> = {};
  76  |       const ls = window.localStorage;
  77  |       for (let i = 0; i < ls.length; i++) {
  78  |         const key = ls.key(i);
  79  |         if (key) data[key] = ls.getItem(key) || "";
  80  |       }
  81  |       return data;
  82  |     });
  83  |     console.log("\n=== LOCAL STORAGE ===");
  84  |     Object.entries(storageData).forEach(([k, v]) => {
  85  |       if (k.includes("supabase") || k.includes("auth")) {
  86  |         console.log(`${k}: ${v.substring(0, 200)}...`);
  87  |       }
  88  |     });
  89  | 
  90  |     // 5. Check final state
  91  |     const currentUrl = page.url();
  92  |     console.log("\n=== STEP 5: Checking result ===");
  93  |     console.log("Current URL:", currentUrl);
  94  | 
  95  |     const isOnDashboard = currentUrl.includes("/dashboard");
  96  |     const isOnLogin = currentUrl.includes("/login");
  97  | 
  98  |     // Check for error messages
  99  |     const errorText = await page.locator('[class*="bg-red-500"]').textContent().catch(() => "");
  100 |     console.log("Error banner text:", errorText);
  101 | 
  102 |     // Log all captured data
  103 |     console.log("\n=== CONSOLE LOGS ===");
  104 |     consoleLogs.forEach((log) => console.log(log));
  105 | 
  106 |     if (errors.length > 0) {
  107 |       console.log("\n=== PAGE ERRORS ===");
  108 |       errors.forEach((err) => console.error(err));
  109 |     }
  110 | 
  111 |     if (httpErrors.length > 0) {
  112 |       console.log("\n=== HTTP ERRORS ===");
  113 |       httpErrors.forEach((err) => console.error(err));
  114 |     }
  115 | 
  116 |     console.log("\n=== FINAL RESULTS ===");
  117 |     console.log("On Dashboard:", isOnDashboard);
  118 |     console.log("On Login:", isOnLogin);
  119 |     console.log("Has Error:", !!errorText);
  120 |     console.log("Console Logs Count:", consoleLogs.length);
  121 |     console.log("Page Errors Count:", errors.length);
  122 |     console.log("HTTP Errors Count:", httpErrors.length);
  123 | 
  124 |     // Assert: we should reach dashboard
> 125 |     expect(isOnDashboard, `Expected dashboard but got: ${currentUrl}`).toBe(true);
      |                                                                        ^ Error: Expected dashboard but got: https://www.aureamaisonfloors.nl/login?cb=1781131817289
  126 |   });
  127 | 
  128 |   test("Auth callback route works", async ({ page }) => {
  129 |     await page.goto(`${BASE_URL}/auth/callback?code=invalid`, { waitUntil: "networkidle" });
  130 |     await page.screenshot({ path: "e2e/screenshots/04-callback-error.png", fullPage: true });
  131 |     const url = page.url();
  132 |     console.log("Callback redirect URL:", url);
  133 |     expect(url).toContain("/login");
  134 |   });
  135 | });
  136 | 
```