import DOMPurify from "dompurify";

export const sanitiseInput = (input: string): string => {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
};

export const sanitiseFormData = <T extends Record<string, unknown>>(
  data: T,
): T => {
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => [
      key,
      typeof value === "string" ? sanitiseInput(value) : value,
    ]),
  ) as T;
};
