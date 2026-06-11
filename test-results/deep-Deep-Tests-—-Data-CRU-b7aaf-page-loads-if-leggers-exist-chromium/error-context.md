# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: deep.spec.ts >> Deep Tests — Data & CRUD >> B6: Leggers detail page loads if leggers exist
- Location: e2e/deep.spec.ts:77:7

# Error details

```
Error: Critical errors detected:
[error] [useAuth] Profile fetch error: {message: TypeError: Failed to fetch, details: TypeError: Failed to fetch, hint: , code: }
```

# Page snapshot

```yaml
- alert [ref=e4]
```

# Test source

```ts
  1  | import type { Page } from "@playwright/test";
  2  | 
  3  | export interface CaptureResult {
  4  |   consoleLogs: string[];
  5  |   pageErrors: string[];
  6  |   httpErrors: string[];
  7  | }
  8  | 
  9  | export function captureErrors(page: Page): CaptureResult {
  10 |   const result: CaptureResult = {
  11 |     consoleLogs: [],
  12 |     pageErrors: [],
  13 |     httpErrors: [],
  14 |   };
  15 | 
  16 |   page.on("console", (msg) => {
  17 |     const text = `[${msg.type()}] ${msg.text()}`;
  18 |     result.consoleLogs.push(text);
  19 |     if (msg.type() === "error" || msg.type() === "warning") {
  20 |       console.log(text);
  21 |     }
  22 |   });
  23 | 
  24 |   page.on("pageerror", (err) => {
  25 |     result.pageErrors.push(err.message);
  26 |     console.error("[PAGE ERROR]", err.message);
  27 |   });
  28 | 
  29 |   page.on("response", async (response) => {
  30 |     if (response.status() >= 400) {
  31 |       const url = response.url();
  32 |       const body = await response.text().catch(() => "");
  33 |       const log = `[HTTP ${response.status()}] ${url} | Body: ${body.substring(0, 500)}`;
  34 |       result.httpErrors.push(log);
  35 |       console.error(log);
  36 |     }
  37 |   });
  38 | 
  39 |   return result;
  40 | }
  41 | 
  42 | export function assertNoCriticalErrors(result: CaptureResult) {
  43 |   const criticalConsole = result.consoleLogs.filter((l) =>
  44 |     l.includes("42P17") || l.includes("infinite recursion") || l.includes("Profile fetch error")
  45 |   );
  46 |   const criticalHttp = result.httpErrors.filter((l) =>
  47 |     l.includes("supabase") && (l.includes("500") || l.includes("42P17") || l.includes("403"))
  48 |   );
  49 | 
  50 |   if (criticalConsole.length > 0 || criticalHttp.length > 0) {
  51 |     const msg = [
  52 |       "Critical errors detected:",
  53 |       ...criticalConsole,
  54 |       ...criticalHttp,
  55 |     ].join("\n");
> 56 |     throw new Error(msg);
     |           ^ Error: Critical errors detected:
  57 |   }
  58 | }
  59 | 
```