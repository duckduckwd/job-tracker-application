import { sanitiseFormData, sanitiseInput } from "../sanitisation";

// Mock console.warn to avoid noise in test output
jest.spyOn(console, "warn").mockImplementation(() => {});

// Clean up mocks after tests
afterAll(() => {
  jest.restoreAllMocks();
});

describe("sanitiseInput", () => {
  it("should remove script tags", () => {
    const maliciousInput = '<script>alert("xss")</script>Hello';
    const result = sanitiseInput(maliciousInput);

    expect(result).toBe("Hello");
    expect(result).not.toContain("<script>");
    expect(result).not.toContain("alert");
  });

  it("should remove all HTML tags", () => {
    const htmlInput = "<div><p>Hello <strong>World</strong></p></div>";
    const result = sanitiseInput(htmlInput);

    expect(result).toBe("Hello World");
    expect(result).not.toContain("<");
    expect(result).not.toContain(">");
  });

  it("should preserve plain text content", () => {
    const plainText = "Hello World 123";
    const result = sanitiseInput(plainText);

    expect(result).toBe(plainText);
  });

  it("should handle empty strings", () => {
    const result = sanitiseInput("");

    expect(result).toBe("");
  });

  it("should handle strings with special characters", () => {
    const specialChars = "Hello & goodbye! @#$%^&*()";
    const result = sanitiseInput(specialChars);

    expect(result).toBe(specialChars);
  });

  it("should remove dangerous attributes", () => {
    const maliciousInput = '<img src="x" onerror="alert(1)">Image';
    const result = sanitiseInput(maliciousInput);

    expect(result).toBe("Image");
    expect(result).not.toContain("onerror");
    expect(result).not.toContain("alert");
  });

  it("should handle javascript: URLs", () => {
    const maliciousInput = '<a href="javascript:alert(1)">Click</a>';
    const result = sanitiseInput(maliciousInput);

    expect(result).toBe("Click");
    expect(result).not.toContain("javascript:");
    expect(result).not.toContain("alert");
  });

  it("should handle very long strings", () => {
    const longString = `${"A".repeat(10000)}<script>alert("xss")</script>${"B".repeat(10000)}`;
    const result = sanitiseInput(longString);

    expect(result).toBe("A".repeat(10000) + "B".repeat(10000));
    expect(result).not.toContain("<script>");
  });

  it("should handle unicode and emoji characters", () => {
    const unicodeInput = "🚀 Hello 世界 <script>alert(1)</script> 🎉";
    const result = sanitiseInput(unicodeInput);

    expect(result).toBe("🚀 Hello 世界  🎉");
    expect(result).not.toContain("<script>");
  });

  it("should handle nested malicious content", () => {
    const nestedInput = "<div><script><script>alert(1)</script></script></div>";
    const result = sanitiseInput(nestedInput);

    expect(result).toBe("");
    expect(result).not.toContain("<script>");
    expect(result).not.toContain("alert");
  });

  it("should handle malformed HTML gracefully", () => {
    const malformedInput = "<div><p>Unclosed tags<script>alert(1)";
    const result = sanitiseInput(malformedInput);

    expect(result).toBe("Unclosed tags");
    expect(result).not.toContain("<script>");
    expect(result).not.toContain("alert");
  });

  it("should handle HTML entities correctly", () => {
    const entityInput = "&lt;script&gt;alert(1)&lt;/script&gt;Safe &amp; sound";
    const result = sanitiseInput(entityInput);

    // DOMPurify preserves HTML entities as-is when no tags are allowed
    expect(result).toBe(
      "&lt;script&gt;alert(1)&lt;/script&gt;Safe &amp; sound",
    );
    expect(result).not.toContain("<script>");
  });

  it("should handle data URLs and other protocols", () => {
    const dataUrlInput =
      '<img src="data:image/svg+xml;base64,PHN2Zz48c2NyaXB0PmFsZXJ0KDEpPC9zY3JpcHQ+PC9zdmc+">';
    const result = sanitiseInput(dataUrlInput);

    expect(result).toBe("");
    expect(result).not.toContain("data:");
  });
});

describe("sanitiseFormData", () => {
  it("should sanitise string values in form data", () => {
    const formData = {
      name: '<script>alert("xss")</script>John',
      email: "john@example.com",
      bio: "<p>Hello <strong>World</strong></p>",
    };

    const result = sanitiseFormData(formData);

    expect(result.name).toBe("John");
    expect(result.email).toBe("john@example.com");
    expect(result.bio).toBe("Hello World");
  });

  it("should preserve non-string values unchanged", () => {
    const formData = {
      name: '<script>alert("xss")</script>John',
      age: 25,
      isActive: true,
      tags: ["tag1", "tag2"],
      metadata: { key: "value" },
      nullValue: null,
      undefinedValue: undefined,
    };

    const result = sanitiseFormData(formData);

    expect(result.name).toBe("John");
    expect(result.age).toBe(25);
    expect(result.isActive).toBe(true);
    expect(result.tags).toEqual(["tag1", "tag2"]);
    expect(result.metadata).toEqual({ key: "value" });
    expect(result.nullValue).toBeNull();
    expect(result.undefinedValue).toBeUndefined();
  });

  it("should handle empty objects", () => {
    const result = sanitiseFormData({});

    expect(result).toEqual({});
  });

  it("should maintain object structure", () => {
    const formData = {
      user: {
        name: '<script>alert("xss")</script>John',
        profile: {
          bio: "<p>Developer</p>",
        },
      },
      count: 42,
    };

    const result = sanitiseFormData(formData);

    expect(result).toHaveProperty("user");
    expect(result).toHaveProperty("count");
    expect(result.count).toBe(42);
    // Note: nested objects are not recursively sanitised by current implementation
    expect(typeof result.user).toBe("object");
  });

  it("should handle form data with mixed content types", () => {
    const formData = {
      title: "<h1>Important Title</h1>",
      description: "<script>malicious()</script>Safe content",
      priority: 1,
      enabled: false,
      createdAt: new Date("2023-01-01"),
    };

    const result = sanitiseFormData(formData);

    expect(result.title).toBe("Important Title");
    expect(result.description).toBe("Safe content");
    expect(result.priority).toBe(1);
    expect(result.enabled).toBe(false);
    expect(result.createdAt).toBeInstanceOf(Date);
  });

  it("should preserve type safety", () => {
    interface UserForm {
      name: string;
      email: string;
      age: number;
      [key: string]: unknown;
    }

    const formData: UserForm = {
      name: '<script>alert("xss")</script>John',
      email: "john@example.com",
      age: 25,
    };

    const result = sanitiseFormData(formData);

    // TypeScript should maintain the interface type
    expect(typeof result.name).toBe("string");
    expect(typeof result.email).toBe("string");
    expect(typeof result.age).toBe("number");
    expect(result.name).toBe("John");
  });

  it("should handle arrays with string elements", () => {
    const formData = {
      tags: ["<script>tag1</script>", "normal-tag", "<b>bold-tag</b>"],
      name: "<script>alert(1)</script>John",
    };

    const result = sanitiseFormData(formData);

    expect(result.name).toBe("John");
    // Arrays are preserved as-is (not recursively processed)
    expect(Array.isArray(result.tags)).toBe(true);
    expect(result.tags).toEqual([
      "<script>tag1</script>",
      "normal-tag",
      "<b>bold-tag</b>",
    ]);
  });

  it("should handle form data with zero and falsy values", () => {
    const formData = {
      count: 0,
      empty: "",
      whitespace: "   ",
      malicious: "<script>alert(1)</script>",
      falsyBool: false,
    };

    const result = sanitiseFormData(formData);

    expect(result.count).toBe(0);
    expect(result.empty).toBe("");
    expect(result.whitespace).toBe("   ");
    expect(result.malicious).toBe("");
    expect(result.falsyBool).toBe(false);
  });

  it("should handle invalid input types gracefully", () => {
    // Test null input - should not throw and return safe fallback
    expect(() => sanitiseInput(null as any)).not.toThrow();
    expect(sanitiseInput(null as any)).toBe("");

    // Test undefined input - should not throw and return safe fallback
    expect(() => sanitiseInput(undefined as any)).not.toThrow();
    expect(sanitiseInput(undefined as any)).toBe("");

    // Test number input - should not throw and convert to string
    expect(() => sanitiseInput(123 as any)).not.toThrow();
    expect(sanitiseInput(123 as any)).toBe("123");

    // Test boolean input - should not throw and convert to string
    expect(() => sanitiseInput(true as any)).not.toThrow();
    expect(sanitiseInput(true as any)).toBe("true");

    // Test object input - should not throw and handle gracefully
    expect(() => sanitiseInput({} as any)).not.toThrow();
  });

  it("should handle circular references gracefully", () => {
    const circularObj: any = { name: "<script>alert(1)</script>test" };
    circularObj.self = circularObj;

    const result = sanitiseFormData(circularObj);

    expect(result.name).toBe("test");
    expect(result.self).toBe(circularObj.self); // Circular reference preserved
  });

  it("should handle symbols and functions as values", () => {
    const sym = Symbol("test");
    const fn = () => "test";

    const formData = {
      name: "<script>alert(1)</script>John",
      symbol: sym,
      func: fn,
    };

    const result = sanitiseFormData(formData);

    expect(result.name).toBe("John");
    expect(result.symbol).toBe(sym);
    expect(result.func).toBe(fn);
  });

  it("should document current behavior with invalid form data", () => {
    // Current implementation throws with null/undefined - this documents the behavior
    expect(() => sanitiseFormData(null as any)).toThrow(
      "Cannot convert undefined or null to object",
    );
    expect(() => sanitiseFormData(undefined as any)).toThrow(
      "Cannot convert undefined or null to object",
    );

    // Non-objects are handled by Object.entries - they return empty arrays or convert
    const stringResult = sanitiseFormData("not an object" as any);
    const numberResult = sanitiseFormData(123 as any);

    // Strings get converted to character-indexed objects by Object.entries
    expect(stringResult).toHaveProperty("0", "n");
    expect(stringResult).toHaveProperty("1", "o");

    // Numbers return empty objects
    expect(numberResult).toEqual({});
  });

  it("should handle objects with getter properties", () => {
    // Create object with getter that returns a string
    const objectWithGetter = {
      get name() {
        return "<script>alert(1)</script>computed";
      },
      static: "normal value",
    };

    const result = sanitiseFormData(objectWithGetter);

    expect(result.name).toBe("computed");
    expect(result.static).toBe("normal value");
  });

  it("should handle form data with complex nested structures", () => {
    const complexFormData = {
      user: {
        profile: {
          bio: "<script>alert(1)</script>Developer",
        },
      },
      tags: ["<b>tag1</b>", "tag2"],
      metadata: new Map([["key", "<i>value</i>"]]),
      date: new Date("2023-01-01"),
    };

    const result = sanitiseFormData(complexFormData);

    // Only top-level strings are sanitized
    expect(typeof result.user).toBe("object");
    expect(Array.isArray(result.tags)).toBe(true);
    expect(result.metadata).toBeInstanceOf(Map);
    expect(result.date).toBeInstanceOf(Date);
  });
});
