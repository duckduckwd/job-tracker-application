/**
 * @jest-environment jsdom
 */

import { formatCurrency, formatDate, truncateText } from "../format";

describe("formatDate", () => {
  beforeEach(() => {
    // Mock timezone to ensure consistent test results
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2023-01-01T00:00:00.000Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should format Date object correctly", () => {
    const date = new Date("2023-12-25T10:30:00.000Z");
    const result = formatDate(date);
    expect(result).toMatch(/(?:\d{1,2}\/){2}\d{4}/);
  });

  it("should format date string correctly", () => {
    const dateString = "2023-06-15";
    const result = formatDate(dateString);
    expect(result).toMatch(/(?:\d{1,2}\/){2}\d{4}/);
  });

  it("should format ISO date string correctly", () => {
    const isoString = "2023-03-10T14:30:00.000Z";
    const result = formatDate(isoString);
    expect(result).toMatch(/(?:\d{1,2}\/){2}\d{4}/);
  });

  it("should handle leap year dates", () => {
    const leapYearDate = new Date("2024-02-29");
    const result = formatDate(leapYearDate);
    expect(result).toMatch(/(?:\d{1,2}\/){2}2024/);
  });

  it("should handle edge case dates", () => {
    const newYear = new Date("2023-01-01");
    const newYearEve = new Date("2023-12-31");

    expect(formatDate(newYear)).toMatch(/(?:\d{1,2}\/){2}2023/);
    expect(formatDate(newYearEve)).toMatch(/(?:\d{1,2}\/){2}2023/);
  });

  it("should handle invalid date strings gracefully", () => {
    const invalidDate = "invalid-date";
    const result = formatDate(invalidDate);
    expect(result).toBe("Invalid Date");
  });

  it("should handle empty string", () => {
    const result = formatDate("");
    expect(result).toBe("Invalid Date");
  });
});

describe("formatCurrency", () => {
  it("should format positive amounts correctly", () => {
    expect(formatCurrency(1234.56)).toBe("$1,234.56");
    expect(formatCurrency(100)).toBe("$100.00");
    expect(formatCurrency(0.99)).toBe("$0.99");
  });

  it("should format zero correctly", () => {
    expect(formatCurrency(0)).toBe("$0.00");
  });

  it("should format negative amounts correctly", () => {
    expect(formatCurrency(-1234.56)).toBe("-$1,234.56");
    expect(formatCurrency(-100)).toBe("-$100.00");
  });

  it("should format large amounts with proper comma separation", () => {
    expect(formatCurrency(1000000)).toBe("$1,000,000.00");
    expect(formatCurrency(1234567.89)).toBe("$1,234,567.89");
  });

  it("should format small decimal amounts correctly", () => {
    expect(formatCurrency(0.01)).toBe("$0.01");
    expect(formatCurrency(0.001)).toBe("$0.00"); // Rounds to nearest cent
    expect(formatCurrency(0.005)).toBe("$0.01"); // Rounds up
  });

  it("should handle very large numbers", () => {
    expect(formatCurrency(999999999.99)).toBe("$999,999,999.99");
  });

  it("should handle floating point precision issues", () => {
    expect(formatCurrency(0.1 + 0.2)).toBe("$0.30"); // 0.1 + 0.2 = 0.30000000000000004
    expect(formatCurrency(1.005)).toBe("$1.01"); // Banker's rounding
  });

  it("should handle integer amounts", () => {
    expect(formatCurrency(42)).toBe("$42.00");
    expect(formatCurrency(1000)).toBe("$1,000.00");
  });

  it("should handle NaN gracefully", () => {
    expect(formatCurrency(NaN)).toBe("$NaN");
  });

  it("should handle Infinity", () => {
    expect(formatCurrency(Infinity)).toBe("$∞");
    expect(formatCurrency(-Infinity)).toBe("-$∞");
  });
});

describe("truncateText", () => {
  it("should truncate text longer than maxLength", () => {
    const text = "This is a very long text that should be truncated";
    const result = truncateText(text, 20);
    expect(result).toBe("This is a very long ...");
    expect(result.length).toBe(23); // 20 + '...' = 23
  });

  it("should return original text if shorter than maxLength", () => {
    const text = "Short text";
    const result = truncateText(text, 20);
    expect(result).toBe("Short text");
  });

  it("should return original text if equal to maxLength", () => {
    const text = "Exactly twenty chars";
    const result = truncateText(text, 20);
    expect(result).toBe("Exactly twenty chars");
  });

  it("should handle empty string", () => {
    const result = truncateText("", 10);
    expect(result).toBe("");
  });

  it("should handle maxLength of 0", () => {
    const text = "Some text";
    const result = truncateText(text, 0);
    expect(result).toBe("...");
  });

  it("should handle maxLength of 1", () => {
    const text = "Some text";
    const result = truncateText(text, 1);
    expect(result).toBe("S...");
  });

  it("should handle very long text", () => {
    const longText = "a".repeat(1000);
    const result = truncateText(longText, 50);
    expect(result).toBe(`${"a".repeat(50)}...`);
    expect(result.length).toBe(53);
  });

  it("should handle unicode characters", () => {
    const unicodeText = "🚀 Unicode test with émojis and spëcial chars 🎉";
    const result = truncateText(unicodeText, 20);
    expect(result).toBe("🚀 Unicode test with...");
  });

  it("should handle text with newlines and spaces", () => {
    const textWithSpaces = "Text with\nnewlines and  spaces";
    const result = truncateText(textWithSpaces, 15);
    expect(result).toBe("Text with\nnewli...");
  });

  it("should handle negative maxLength gracefully", () => {
    const text = "Some text";
    const result = truncateText(text, -5);
    expect(result).toBe("Some...");
  });

  it("should preserve word boundaries when possible", () => {
    const text = "This is a test sentence";
    const result = truncateText(text, 10);
    expect(result).toBe("This is a ...");
  });
});

describe("format utilities edge cases", () => {
  it("should handle null and undefined inputs gracefully", () => {
    // formatDate with null returns epoch date, undefined returns Invalid Date
    expect(formatDate(null as any)).toBe("1/1/1970");
    expect(formatDate(undefined as any)).toBe("Invalid Date");
    expect(() => formatCurrency(null as any)).not.toThrow();
    expect(() => formatCurrency(undefined as any)).not.toThrow();
    expect(() => truncateText(null as any, 10)).toThrow();
    expect(() => truncateText(undefined as any, 10)).toThrow();
  });

  it("should handle type coercion scenarios", () => {
    // Date accepts numbers as timestamps
    const timestamp = 1672531200000; // 2023-01-01
    const result = formatDate(timestamp as any);
    expect(result).toMatch(/(?:\d{1,2}\/){2}2023/);
  });
});
