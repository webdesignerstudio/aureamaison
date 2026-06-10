import { describe, it, expect } from "vitest";
import { formatEuro, formatDate, generateUAID } from "./utils";

describe("formatEuro", () => {
  it("formats 0 as € 0,00", () => {
    expect(formatEuro(0)).toBe("0,00");
  });

  it("formats 1234.56 as 1.234,56", () => {
    expect(formatEuro(1234.56)).toBe("1.234,56");
  });

  it("handles null/undefined as 0", () => {
    expect(formatEuro(null)).toBe("0,00");
    expect(formatEuro(undefined)).toBe("0,00");
  });
});

describe("formatDate", () => {
  it("formats ISO date to nl-NL format", () => {
    expect(formatDate("2024-06-10")).toMatch(/10[\-\/]06[\-\/]2024/);
  });

  it("returns empty string for null/undefined", () => {
    expect(formatDate(null)).toBe("");
    expect(formatDate(undefined)).toBe("");
  });
});

describe("generateUAID", () => {
  it("starts with HD- and current year", () => {
    const year = new Date().getFullYear();
    const uaid = generateUAID();
    expect(uaid).toMatch(new RegExp(`^HD-${year}-\\d{6}$`));
  });

  it("generates different values on multiple calls", () => {
    const a = generateUAID();
    const b = generateUAID();
    expect(a).not.toBe(b);
  });
});
