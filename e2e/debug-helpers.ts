import type { Page } from "@playwright/test";

export interface CaptureResult {
  consoleLogs: string[];
  pageErrors: string[];
  httpErrors: string[];
}

export function captureErrors(page: Page): CaptureResult {
  const result: CaptureResult = {
    consoleLogs: [],
    pageErrors: [],
    httpErrors: [],
  };

  page.on("console", (msg) => {
    const text = `[${msg.type()}] ${msg.text()}`;
    result.consoleLogs.push(text);
    if (msg.type() === "error" || msg.type() === "warning") {
      console.log(text);
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
