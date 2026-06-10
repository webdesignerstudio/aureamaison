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
Error: Expected dashboard but got: https://www.aureamaisonfloors.nl/login

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
  68  |     console.log("\n=== STEP 4: Waiting for result ===");
  69  |     await page.waitForTimeout(4000);
  70  |     await page.screenshot({ path: "e2e/screenshots/03-after-submit.png", fullPage: true });
  71  | 
  72  |     // Debug: log localStorage and session
  73  |     const localStorage = await page.evaluate(() => {
  74  |       const data: Record<string, string> = {};
  75  |       for (let i = 0; i < localStorage.length; i++) {
  76  |         const key = localStorage.key(i);
  77  |         if (key) data[key] = localStorage.getItem(key) || "";
  78  |       }
  79  |       return data;
  80  |     });
  81  |     console.log("\n=== LOCAL STORAGE ===");
  82  |     Object.entries(localStorage).forEach(([k, v]) => {
  83  |       if (k.includes("supabase") || k.includes("auth")) {
  84  |         console.log(`${k}: ${v.substring(0, 200)}...`);
  85  |       }
  86  |     });
  87  | 
  88  |     // 5. Check final state
  89  |     const currentUrl = page.url();
  90  |     console.log("\n=== STEP 5: Checking result ===");
  91  |     console.log("Current URL:", currentUrl);
  92  | 
  93  |     const isOnDashboard = currentUrl.includes("/dashboard");
  94  |     const isOnLogin = currentUrl.includes("/login");
  95  | 
  96  |     // Check for error messages
  97  |     const errorText = await page.locator('[class*="bg-red-500"]').textContent().catch(() => "");
  98  |     console.log("Error banner text:", errorText);
  99  | 
  100 |     // Log all captured data
  101 |     console.log("\n=== CONSOLE LOGS ===");
  102 |     consoleLogs.forEach((log) => console.log(log));
  103 | 
  104 |     if (errors.length > 0) {
  105 |       console.log("\n=== PAGE ERRORS ===");
  106 |       errors.forEach((err) => console.error(err));
  107 |     }
  108 | 
  109 |     if (httpErrors.length > 0) {
  110 |       console.log("\n=== HTTP ERRORS ===");
  111 |       httpErrors.forEach((err) => console.error(err));
  112 |     }
  113 | 
  114 |     console.log("\n=== FINAL RESULTS ===");
  115 |     console.log("On Dashboard:", isOnDashboard);
  116 |     console.log("On Login:", isOnLogin);
  117 |     console.log("Has Error:", !!errorText);
  118 |     console.log("Console Logs Count:", consoleLogs.length);
  119 |     console.log("Page Errors Count:", errors.length);
  120 |     console.log("HTTP Errors Count:", httpErrors.length);
  121 | 
  122 |     // Assert: we should reach dashboard
> 123 |     expect(isOnDashboard, `Expected dashboard but got: ${currentUrl}`).toBe(true);
      |                                                                        ^ Error: Expected dashboard but got: https://www.aureamaisonfloors.nl/login
  124 |   });
  125 | 
  126 |   test("Auth callback route works", async ({ page }) => {
  127 |     await page.goto(`${BASE_URL}/auth/callback?code=invalid`, { waitUntil: "networkidle" });
  128 |     await page.screenshot({ path: "e2e/screenshots/04-callback-error.png", fullPage: true });
  129 |     const url = page.url();
  130 |     console.log("Callback redirect URL:", url);
  131 |     expect(url).toContain("/login");
  132 |   });
  133 | });
  134 | 
```