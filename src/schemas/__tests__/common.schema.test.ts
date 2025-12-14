import {
  dateRangeSchema,
  idSchema,
  paginationSchema,
  searchSchema,
} from "../common.schema";

describe("Common Schemas", () => {
  describe("paginationSchema", () => {
    it("validates valid pagination input", () => {
      const result = paginationSchema.parse({ page: 1, limit: 10 });
      expect(result).toEqual({ page: 1, limit: 10 });
    });

    it("applies default values", () => {
      const result = paginationSchema.parse({});
      expect(result).toEqual({ page: 1, limit: 10 });
    });

    it("coerces string numbers", () => {
      const result = paginationSchema.parse({ page: "2", limit: "20" });
      expect(result).toEqual({ page: 2, limit: 20 });
    });

    it("rejects negative page", () => {
      expect(() => paginationSchema.parse({ page: -1 })).toThrow();
    });

    it("rejects zero page", () => {
      expect(() => paginationSchema.parse({ page: 0 })).toThrow();
    });

    it("rejects limit over 100", () => {
      expect(() => paginationSchema.parse({ limit: 101 })).toThrow();
    });

    it("rejects non-integer values", () => {
      expect(() => paginationSchema.parse({ page: 1.5 })).toThrow();
    });
  });

  describe("idSchema", () => {
    it("validates valid CUID", () => {
      const validCuid = "cjld2cjxh0000qzrmn831i7rn";
      const result = idSchema.parse({ id: validCuid });
      expect(result).toEqual({ id: validCuid });
    });

    it("rejects invalid CUID format", () => {
      expect(() => idSchema.parse({ id: "invalid-id" })).toThrow();
    });

    it("rejects empty string", () => {
      expect(() => idSchema.parse({ id: "" })).toThrow();
    });

    it("rejects missing id", () => {
      expect(() => idSchema.parse({})).toThrow();
    });
  });

  describe("searchSchema", () => {
    it("validates complete search input", () => {
      const input = {
        query: "test",
        sortBy: "name",
        sortOrder: "asc" as const,
      };
      const result = searchSchema.parse(input);
      expect(result).toEqual(input);
    });

    it("applies default sortOrder", () => {
      const result = searchSchema.parse({ query: "test" });
      expect(result).toEqual({ query: "test", sortOrder: "desc" });
    });

    it("handles optional fields", () => {
      const result = searchSchema.parse({});
      expect(result).toEqual({ sortOrder: "desc" });
    });

    it("rejects empty query string", () => {
      expect(() => searchSchema.parse({ query: "" })).toThrow();
    });

    it("rejects query over 100 characters", () => {
      const longQuery = "a".repeat(101);
      expect(() => searchSchema.parse({ query: longQuery })).toThrow();
    });

    it("rejects invalid sortOrder", () => {
      expect(() => searchSchema.parse({ sortOrder: "invalid" })).toThrow();
    });
  });

  describe("dateRangeSchema", () => {
    it("validates valid date range", () => {
      const startDate = new Date("2023-01-01");
      const endDate = new Date("2023-12-31");
      const result = dateRangeSchema.parse({ startDate, endDate });
      expect(result).toEqual({ startDate, endDate });
    });

    it("coerces string dates", () => {
      const result = dateRangeSchema.parse({
        startDate: "2023-01-01",
        endDate: "2023-12-31",
      });
      expect(result.startDate).toBeInstanceOf(Date);
      expect(result.endDate).toBeInstanceOf(Date);
    });

    it("handles optional dates", () => {
      const result = dateRangeSchema.parse({});
      expect(result).toEqual({});
    });

    it("handles only startDate", () => {
      const startDate = new Date("2023-01-01");
      const result = dateRangeSchema.parse({ startDate });
      expect(result).toEqual({ startDate });
    });

    it("handles only endDate", () => {
      const endDate = new Date("2023-12-31");
      const result = dateRangeSchema.parse({ endDate });
      expect(result).toEqual({ endDate });
    });

    it("rejects invalid date strings", () => {
      expect(() =>
        dateRangeSchema.parse({ startDate: "invalid-date" }),
      ).toThrow();
    });
  });
});
