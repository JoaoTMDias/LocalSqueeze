import { describe, expect, it } from "vitest";

import { formatLocalizedNumber, resolveLocale } from "./i18n";

describe("resolveLocale", () => {
  it("resolves Portuguese and English variants", () => {
    expect(resolveLocale("pt")).toBe("pt-PT");
    expect(resolveLocale("pt-PT")).toBe("pt-PT");
    expect(resolveLocale("en-GB")).toBe("en");
  });

  it("falls back to English", () => {
    expect(resolveLocale("fr-FR")).toBe("en");
    expect(resolveLocale()).toBe("en");
  });
});

describe("formatLocalizedNumber", () => {
  it("uses locale-specific decimal separators", () => {
    expect(formatLocalizedNumber(976.6, "en")).toBe("976.6");
    expect(formatLocalizedNumber(976.6, "pt-PT")).toBe("976,6");
  });
});
