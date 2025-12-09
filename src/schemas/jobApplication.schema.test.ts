import type { z } from "zod";

import { jobApplicationSchema } from "./jobApplication.schema";

/**
 * Test utilities for schema validation
 */
const expectValidationSuccess = (
  result: z.SafeParseReturnType<unknown, unknown>,
) => {
  expect(result.success).toBe(true);
};

const expectValidationError = (
  result: z.SafeParseReturnType<unknown, unknown>,
  expectedMessage?: string,
  expectedPath?: string[],
) => {
  expect(result.success).toBe(false);
  if (!result.success && expectedMessage) {
    const issue = expectedPath
      ? result.error.issues.find(
          (i) => i.path.join(".") === expectedPath.join("."),
        )
      : result.error.issues[0];
    expect(issue?.message).toBe(expectedMessage);
  }
};

const createTestData = (overrides = {}) => ({
  roleTitle: "Software Engineer",
  companyName: "Tech Corp",
  roleType: "Full-time",
  location: "London",
  salary: "£50,000",
  advertLink: "https://example.com/job",
  dateApplied: "2024-01-15",
  responseDate: "2024-01-20",
  cvUsed: "CV_2024.pdf",
  status: "Applied",
  contactName: "John Doe",
  contactEmail: "john@example.com",
  contactPhone: "07123 456789",
  isLinkedInConnection: false,
  ...overrides,
});

describe("jobApplicationSchema", () => {
  const validData = createTestData();

  describe("valid data", () => {
    it("should pass validation with all fields", () => {
      const result = jobApplicationSchema.safeParse(validData);
      expectValidationSuccess(result);
    });

    it("should pass validation with only required fields", () => {
      const minimalData = createTestData({
        dateApplied: undefined,
        responseDate: undefined,
        cvUsed: undefined,
        status: undefined,
        contactName: undefined,
        contactEmail: undefined,
        contactPhone: undefined,
        isLinkedInConnection: undefined,
      });
      const result = jobApplicationSchema.safeParse(minimalData);
      expectValidationSuccess(result);
    });
  });

  describe("required fields", () => {
    const requiredFields = [
      { field: "roleTitle", message: "Role is required" },
      { field: "companyName", message: "Company name is required" },
      { field: "roleType", message: "Role type is required" },
      { field: "location", message: "Location is required" },
      { field: "salary", message: "Salary is required" },
      { field: "advertLink", message: "Must be a valid URL" },
    ] as const;

    test.each(requiredFields)(
      "should fail with correct error when $field is missing",
      ({ field, message }) => {
        const data = createTestData({ [field]: "" });
        const result = jobApplicationSchema.safeParse(data);
        expectValidationError(result, message);
      },
    );
  });

  describe("salary validation", () => {
    it("should fail when salary is only whitespace", () => {
      const data = createTestData({ salary: "   " });
      const result = jobApplicationSchema.safeParse(data);
      expectValidationError(result, "Salary cannot be empty");
    });
  });

  describe("URL validation", () => {
    const validUrls = [
      "https://example.com",
      "http://example.com/job",
      "https://example.com/job?id=123&ref=linkedin",
      "https://example.com/careers/jobs/software-engineer",
    ];

    test.each(validUrls)("should pass with valid URL: %s", (url) => {
      const data = createTestData({ advertLink: url });
      const result = jobApplicationSchema.safeParse(data);
      expectValidationSuccess(result);
    });

    it("should fail with invalid URL format", () => {
      const data = createTestData({ advertLink: "not-a-url" });
      const result = jobApplicationSchema.safeParse(data);
      expectValidationError(result, "Must be a valid URL");
    });

    it("should reject javascript: protocol (XSS prevention)", () => {
      const data = createTestData({ advertLink: "javascript:alert('xss')" });
      const result = jobApplicationSchema.safeParse(data);
      expectValidationError(
        result,
        "Only HTTP and HTTPS protocols are allowed",
      );
    });

    it("should reject data: URI (XSS prevention)", () => {
      const data = createTestData({
        advertLink: "data:text/html,<script>alert('xss')</script>",
      });
      const result = jobApplicationSchema.safeParse(data);
      expectValidationError(
        result,
        "Only HTTP and HTTPS protocols are allowed",
      );
    });

    it("should reject file: protocol", () => {
      const data = createTestData({ advertLink: "file:///etc/passwd" });
      const result = jobApplicationSchema.safeParse(data);
      expectValidationError(
        result,
        "Only HTTP and HTTPS protocols are allowed",
      );
    });
  });

  describe("email validation", () => {
    const validEmails = [
      "test@example.com",
      "user+tag@example.com",
      "user@mail.example.com",
      "",
    ];

    test.each(validEmails)("should pass with valid email: %s", (email) => {
      const data = createTestData({ contactEmail: email });
      const result = jobApplicationSchema.safeParse(data);
      expectValidationSuccess(result);
    });

    it("should fail with invalid email format", () => {
      const data = createTestData({ contactEmail: "invalid-email" });
      const result = jobApplicationSchema.safeParse(data);
      expectValidationError(result, "Must be a valid email");
    });
  });

  describe("phone validation", () => {
    const validPhones = [
      "07123 456789",
      "+44 7123 456789",
      "(020) 1234 5678",
      "020-1234-5678",
      "",
    ];

    test.each(validPhones)("should pass with valid phone: %s", (phone) => {
      const data = createTestData({ contactPhone: phone });
      const result = jobApplicationSchema.safeParse(data);
      expectValidationSuccess(result);
    });

    it("should fail with invalid characters", () => {
      const data = createTestData({ contactPhone: "123#456@789" });
      const result = jobApplicationSchema.safeParse(data);
      expectValidationError(result, "Invalid phone number format");
    });
  });

  describe("date validation", () => {
    it("should fail when responseDate is before dateApplied", () => {
      const data = createTestData({
        dateApplied: "2024-01-20",
        responseDate: "2024-01-15",
      });
      const result = jobApplicationSchema.safeParse(data);
      expectValidationError(
        result,
        "Response date cannot be before application date",
        ["responseDate"],
      );
    });

    const validDateScenarios = [
      {
        dateApplied: "2024-01-15",
        responseDate: "2024-01-15",
        desc: "equal dates",
      },
      {
        dateApplied: "2024-01-15",
        responseDate: "2024-01-20",
        desc: "response after applied",
      },
      { dateApplied: "", responseDate: "", desc: "both empty" },
      { dateApplied: "2024-01-15", responseDate: "", desc: "only dateApplied" },
      {
        dateApplied: "",
        responseDate: "2024-01-20",
        desc: "only responseDate",
      },
    ];

    test.each(validDateScenarios)(
      "should pass with $desc",
      ({ dateApplied, responseDate }) => {
        const data = createTestData({ dateApplied, responseDate });
        const result = jobApplicationSchema.safeParse(data);
        expectValidationSuccess(result);
      },
    );

    const invalidDates = [
      { date: "2024-13-45", desc: "invalid month/day" },
      { date: "not-a-date", desc: "non-date string" },
      { date: "15/01/2024", desc: "wrong format (DD/MM/YYYY)" },
    ];

    test.each(invalidDates)("should fail with $desc", ({ date }) => {
      const data = createTestData({ dateApplied: date });
      const result = jobApplicationSchema.safeParse(data);
      expectValidationError(result);
    });
  });

  describe("boundary testing", () => {
    it("should handle very long strings in text fields", () => {
      const longString = "a".repeat(10000);
      const data = createTestData({ roleTitle: longString });
      const result = jobApplicationSchema.safeParse(data);
      expectValidationSuccess(result);
    });

    it("should handle unicode characters", () => {
      const data = createTestData({
        roleTitle: "Développeur Senior",
        companyName: "Société Française",
        contactName: "José García",
      });
      const result = jobApplicationSchema.safeParse(data);
      expectValidationSuccess(result);
    });

    it("should handle emoji in text fields", () => {
      const data = createTestData({
        roleTitle: "Software Engineer 🚀",
        status: "Applied ✅",
      });
      const result = jobApplicationSchema.safeParse(data);
      expectValidationSuccess(result);
    });

    it("should handle Chinese characters", () => {
      const data = createTestData({
        roleTitle: "软件工程师",
        companyName: "科技公司",
      });
      const result = jobApplicationSchema.safeParse(data);
      expectValidationSuccess(result);
    });
  });

  describe("security and injection prevention", () => {
    it("should accept HTML entities in text fields", () => {
      const data = createTestData({
        roleTitle: "Senior &lt;Developer&gt;",
        companyName: "Tech &amp; Co",
      });
      const result = jobApplicationSchema.safeParse(data);
      expectValidationSuccess(result);
    });

    it("should accept SQL-like strings in text fields", () => {
      const data = createTestData({
        roleTitle: "Developer'; DROP TABLE users;--",
      });
      const result = jobApplicationSchema.safeParse(data);
      expectValidationSuccess(result);
    });

    it("should accept script tags in text fields (sanitization should happen elsewhere)", () => {
      const data = createTestData({
        contactName: "<script>alert('xss')</script>",
      });
      const result = jobApplicationSchema.safeParse(data);
      expectValidationSuccess(result);
    });

    it("should fail with javascript: protocol in email", () => {
      const data = createTestData({
        contactEmail: "javascript:alert('xss')@example.com",
      });
      const result = jobApplicationSchema.safeParse(data);
      expectValidationError(result);
    });
  });
});
