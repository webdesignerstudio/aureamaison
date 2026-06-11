import type { Page } from "@playwright/test";

export interface CaptureResult {
  consoleLogs: string[];
  pageErrors: string[];
  httpErrors: string[];
  supabaseErrors: string[];
}

export function captureErrors(page: Page): CaptureResult {
  const result: CaptureResult = {
    consoleLogs: [],
    pageErrors: [],
    httpErrors: [],
    supabaseErrors: [],
  };

  page.on("console", (msg) => {
    const text = `[${msg.type()}] ${msg.text()}`;
    result.consoleLogs.push(text);
    if (msg.type() === "error" || msg.type() === "warning") {
      console.log(text);
    }
    if (text.includes("supabase") && (text.includes("403") || text.includes("401") || text.includes("500"))) {
      result.supabaseErrors.push(text);
    }
  });

  page.on("pageerror", (err) => {
    result.pageErrors.push(err.message);
    console.error("[PAGE ERROR]", err.message);
  });

  page.on("response", async (response) => {
    if (response.status() >= 400) {
      const url = response.url();
      const body = await response.text().catch(() => "");
      const log = `[HTTP ${response.status()}] ${url} | Body: ${body.substring(0, 500)}`;
      result.httpErrors.push(log);
      console.error(log);
      if (url.includes("supabase") || url.includes("rest/v1")) {
        result.supabaseErrors.push(log);
      }
    }
  });

  return result;
}

export function assertNoCriticalErrors(result: CaptureResult) {
  const criticalConsole = result.consoleLogs.filter((l) =>
    l.includes("42P17") || l.includes("infinite recursion") || l.includes("Profile fetch error")
  );
  const criticalHttp = result.httpErrors.filter((l) =>
    l.includes("supabase") && (l.includes("500") || l.includes("42P17") || l.includes("403"))
  );

  if (criticalConsole.length > 0 || criticalHttp.length > 0) {
    const msg = [
      "Critical errors detected:",
      ...criticalConsole,
      ...criticalHttp,
    ].join("\n");
    throw new Error(msg);
  }
}

export function assertNoSupabaseErrors(result: CaptureResult) {
  if (result.supabaseErrors.length > 0) {
    const msg = [
      "Supabase errors detected:",
      ...result.supabaseErrors,
    ].join("\n");
    throw new Error(msg);
  }
}

export function assertNoConsoleErrors(result: CaptureResult) {
  const errors = result.consoleLogs.filter((l) => l.startsWith("[error]"));
  if (errors.length > 0) {
    const msg = ["Console errors detected:", ...errors].join("\n");
    throw new Error(msg);
  }
}

export function printErrorSummary(result: CaptureResult) {
  console.log("\n=== ERROR SUMMARY ===");
  console.log(`Console logs: ${result.consoleLogs.length}`);
  console.log(`Page errors: ${result.pageErrors.length}`);
  console.log(`HTTP errors: ${result.httpErrors.length}`);
  console.log(`Supabase errors: ${result.supabaseErrors.length}`);
  if (result.httpErrors.length > 0) {
    console.log("\nHTTP Errors:");
    result.httpErrors.forEach((e) => console.log("  -", e));
  }
  if (result.supabaseErrors.length > 0) {
    console.log("\nSupabase Errors:");
    result.supabaseErrors.forEach((e) => console.log("  -", e));
  }
  console.log("=====================\n");
}
