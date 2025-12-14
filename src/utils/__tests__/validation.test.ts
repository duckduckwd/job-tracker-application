/**
 * @jest-environment jsdom
 */

import { isValidEmail, isValidUrl, sanitizeString } from "../validation";

describe("isValidEmail", () => {
  it("should validate correct email formats", () => {
    const validEmails = [
      "test@example.com",
      "user.name@domain.co.uk",
      "user+tag@example.org",
      "user123@test-domain.com",
      "a@b.co",
      "very.long.email.address@very.long.domain.name.com",
      "user@subdomain.example.com",
      "test_email@example.net",
      "user-name@example.io",
    ];

    for (const email of validEmails) {
      expect(isValidEmail(email)).toBe(true);
    }
  });

  it("should reject invalid email formats", () => {
    const invalidEmails = [
      "",
      "invalid",
      "@example.com",
      "user@",
      "user@@example.com",
      "user@.com",
      "user@com",
      "user name@example.com",
      "user@example",
      "user@example.",
    ];

    for (const email of invalidEmails) {
      expect(isValidEmail(email)).toBe(false);
    }
  });

  it("should handle edge cases", () => {
    expect(isValidEmail("a@b.c")).toBe(true); // Minimal valid email
    expect(isValidEmail("test@localhost.localdomain")).toBe(true);
    expect(isValidEmail("user@192.168.1.1")).toBe(true); // IP addresses are valid with this regex
  });

  it("should handle special characters correctly", () => {
    expect(isValidEmail("user+filter@example.com")).toBe(true);
    expect(isValidEmail("user_name@example.com")).toBe(true);
    expect(isValidEmail("user-name@example.com")).toBe(true);
    expect(isValidEmail("user.name@example.com")).toBe(true);
    expect(isValidEmail("user@sub-domain.example.com")).toBe(true);
  });

  it("should reject emails with multiple @ symbols", () => {
    expect(isValidEmail("user@@example.com")).toBe(false);
    expect(isValidEmail("user@example@com")).toBe(false);
    expect(isValidEmail("@user@example.com")).toBe(false);
  });

  it("should handle unicode characters", () => {
    // This basic regex actually accepts unicode characters
    expect(isValidEmail("user@münchen.de")).toBe(true);
    expect(isValidEmail("用户@example.com")).toBe(true);
  });
});

describe("isValidUrl", () => {
  it("should validate correct URL formats", () => {
    const validUrls = [
      "https://example.com",
      "http://example.com",
      "https://www.example.com",
      "https://subdomain.example.com",
      "https://example.com/path",
      "https://example.com/path/to/resource",
      "https://example.com:8080",
      "https://example.com?query=value",
      "https://example.com#fragment",
      "https://example.com/path?query=value#fragment",
      "ftp://files.example.com",
      "file:///path/to/file",
      "mailto:user@example.com",
      "tel:+1234567890",
    ];

    for (const url of validUrls) {
      expect(isValidUrl(url)).toBe(true);
    }
  });

  it("should reject invalid URL formats", () => {
    const invalidUrls = ["", "invalid", "not-a-url", "://example.com"];

    for (const url of invalidUrls) {
      expect(isValidUrl(url)).toBe(false);
    }
  });

  it("should handle different protocols", () => {
    expect(isValidUrl("https://example.com")).toBe(true);
    expect(isValidUrl("http://example.com")).toBe(true);
    expect(isValidUrl("ftp://example.com")).toBe(true);
    expect(isValidUrl("file:///path/to/file")).toBe(true);
    expect(isValidUrl("data:text/plain;base64,SGVsbG8=")).toBe(true);
    expect(isValidUrl('javascript:alert("xss")')).toBe(true); // URL constructor allows this
  });

  it("should handle URLs with ports", () => {
    expect(isValidUrl("https://example.com:443")).toBe(true);
    expect(isValidUrl("http://example.com:80")).toBe(true);
    expect(isValidUrl("https://example.com:8080")).toBe(true);
    expect(isValidUrl("http://localhost:3000")).toBe(true);
  });

  it("should handle URLs with query parameters", () => {
    expect(isValidUrl("https://example.com?param=value")).toBe(true);
    expect(isValidUrl("https://example.com?param1=value1&param2=value2")).toBe(
      true,
    );
    expect(isValidUrl("https://example.com?param=value with spaces")).toBe(
      true,
    );
  });

  it("should handle URLs with fragments", () => {
    expect(isValidUrl("https://example.com#section")).toBe(true);
    expect(isValidUrl("https://example.com/path#section")).toBe(true);
    expect(isValidUrl("https://example.com?param=value#section")).toBe(true);
  });

  it("should handle localhost and IP addresses", () => {
    expect(isValidUrl("http://localhost")).toBe(true);
    expect(isValidUrl("http://127.0.0.1")).toBe(true);
    expect(isValidUrl("http://192.168.1.1")).toBe(true);
    expect(isValidUrl("http://[::1]")).toBe(true); // IPv6
  });

  it("should handle relative URLs as invalid", () => {
    expect(isValidUrl("/path/to/resource")).toBe(false);
    expect(isValidUrl("./relative/path")).toBe(false);
    expect(isValidUrl("../parent/path")).toBe(false);
    expect(isValidUrl("?query=value")).toBe(false);
    expect(isValidUrl("#fragment")).toBe(false);
  });
});

describe("sanitizeString", () => {
  it("should remove angle brackets", () => {
    expect(sanitizeString('<script>alert("xss")</script>')).toBe(
      'scriptalert("xss")/script',
    );
    expect(sanitizeString("<div>content</div>")).toBe("divcontent/div");
    expect(sanitizeString("<>empty tags</>")).toBe("empty tags/");
  });

  it("should trim whitespace", () => {
    expect(sanitizeString("  hello world  ")).toBe("hello world");
    expect(sanitizeString("\t\ntest\t\n")).toBe("test");
    expect(sanitizeString("   ")).toBe("");
  });

  it("should handle both trimming and bracket removal", () => {
    expect(sanitizeString('  <script>alert("test")</script>  ')).toBe(
      'scriptalert("test")/script',
    );
    expect(sanitizeString("\n\t<div>content</div>\n\t")).toBe("divcontent/div");
  });

  it("should handle empty and whitespace-only strings", () => {
    expect(sanitizeString("")).toBe("");
    expect(sanitizeString("   ")).toBe("");
    expect(sanitizeString("\t\n\r ")).toBe("");
  });

  it("should preserve other special characters", () => {
    expect(sanitizeString("hello@world.com")).toBe("hello@world.com");
    expect(sanitizeString("price: $19.99")).toBe("price: $19.99");
    expect(sanitizeString("user & admin")).toBe("user & admin");
    expect(sanitizeString("50% off!")).toBe("50% off!");
  });

  it("should handle mixed content", () => {
    expect(sanitizeString("  Hello <world> & <universe>!  ")).toBe(
      "Hello world & universe!",
    );
    expect(sanitizeString("<p>Price: $<span>19.99</span></p>")).toBe(
      "pPrice: $span19.99/span/p",
    );
  });

  it("should handle multiple consecutive brackets", () => {
    expect(sanitizeString("<<>>")).toBe("");
    expect(sanitizeString("<<<test>>>")).toBe("test");
    expect(sanitizeString("<><><>content<><><>")).toBe("content");
  });

  it("should handle unicode characters", () => {
    expect(sanitizeString("  Hello 世界 <test>  ")).toBe("Hello 世界 test");
    expect(sanitizeString("<div>émojis 🚀 and spëcial chars</div>")).toBe(
      "divémojis 🚀 and spëcial chars/div",
    );
  });

  it("should handle very long strings", () => {
    const longString = `${"a".repeat(1000)}<script>${"b".repeat(1000)}</script>${"c".repeat(1000)}`;
    const expected = `${"a".repeat(1000)}script${"b".repeat(1000)}/script${"c".repeat(1000)}`;
    expect(sanitizeString(longString)).toBe(expected);
  });

  it("should handle strings with only brackets", () => {
    expect(sanitizeString("<")).toBe("");
    expect(sanitizeString(">")).toBe("");
    expect(sanitizeString("<>")).toBe("");
    expect(sanitizeString("><")).toBe("");
  });
});

describe("validation utilities edge cases", () => {
  it("should handle type coercion gracefully", () => {
    // These functions handle type coercion through JavaScript's built-in mechanisms
    expect(isValidEmail(null as any)).toBe(false);
    expect(isValidEmail(undefined as any)).toBe(false);
    expect(isValidEmail(123 as any)).toBe(false); // Number gets converted to string

    expect(isValidUrl(null as any)).toBe(false); // URL constructor converts null to 'null'
    expect(isValidUrl(undefined as any)).toBe(false); // URL constructor converts undefined to 'undefined'
    expect(isValidUrl(123 as any)).toBe(false); // URL constructor converts number to string

    expect(() => sanitizeString(null as any)).toThrow();
    expect(() => sanitizeString(undefined as any)).toThrow();
    expect(() => sanitizeString(123 as any)).toThrow();
  });

  it("should handle empty string inputs consistently", () => {
    expect(isValidEmail("")).toBe(false);
    expect(isValidUrl("")).toBe(false);
    expect(sanitizeString("")).toBe("");
  });

  it("should handle performance with large inputs", () => {
    const largeEmail = `${"a".repeat(1000)}@${"b".repeat(1000)}.com`;
    const largeUrl = `https://${"a".repeat(1000)}.com/${"b".repeat(1000)}`;
    const largeString = `${"a".repeat(10000)}<script>${"b".repeat(10000)}`;

    // These should complete without hanging
    expect(typeof isValidEmail(largeEmail)).toBe("boolean");
    expect(typeof isValidUrl(largeUrl)).toBe("boolean");
    expect(typeof sanitizeString(largeString)).toBe("string");
  });
});
