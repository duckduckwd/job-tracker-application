/**
 * @jest-environment jsdom
 */

import { cn } from "../cn";

describe("cn", () => {
  it("should merge simple class strings", () => {
    expect(cn("class1", "class2")).toBe("class1 class2");
    expect(cn("bg-red-500", "text-white")).toBe("bg-red-500 text-white");
  });

  it("should handle single class input", () => {
    expect(cn("single-class")).toBe("single-class");
    expect(cn("bg-blue-500")).toBe("bg-blue-500");
  });

  it("should handle empty inputs", () => {
    expect(cn()).toBe("");
    expect(cn("")).toBe("");
    expect(cn("", "")).toBe("");
  });

  it("should handle conditional classes with objects", () => {
    expect(
      cn({
        active: true,
        disabled: false,
        hidden: true,
      }),
    ).toBe("active hidden");

    expect(
      cn({
        "bg-red-500": true,
        "bg-blue-500": false,
        "text-white": true,
      }),
    ).toBe("bg-red-500 text-white");
  });

  it("should handle arrays of classes", () => {
    expect(cn(["class1", "class2"])).toBe("class1 class2");
    expect(cn(["bg-red-500", "text-white", "p-4"])).toBe(
      "bg-red-500 text-white p-4",
    );
  });

  it("should handle mixed input types", () => {
    expect(
      cn(
        "base-class",
        { conditional: true, hidden: false },
        ["array-class1", "array-class2"],
        "final-class",
      ),
    ).toBe("base-class conditional array-class1 array-class2 final-class");
  });

  it("should resolve Tailwind conflicts with twMerge", () => {
    // Later classes should override earlier ones for the same property
    expect(cn("bg-red-500", "bg-blue-500")).toBe("bg-blue-500");
    expect(cn("p-4", "p-8")).toBe("p-8");
    expect(cn("text-sm", "text-lg")).toBe("text-lg");
  });

  it("should handle complex Tailwind conflicts", () => {
    expect(cn("px-4 py-2", "p-8")).toBe("p-8");
    expect(cn("m-4", "mx-8 my-2")).toBe("m-4 mx-8 my-2"); // twMerge doesn't resolve this specific conflict
    expect(cn("border-2 border-red-500", "border-blue-500")).toBe(
      "border-2 border-blue-500",
    );
  });

  it("should preserve non-conflicting classes", () => {
    expect(cn("bg-red-500 text-white", "p-4 rounded")).toBe(
      "bg-red-500 text-white p-4 rounded",
    );
    expect(cn("flex items-center", "justify-between gap-4")).toBe(
      "flex items-center justify-between gap-4",
    );
  });

  it("should handle responsive and state variants", () => {
    expect(cn("bg-red-500", "md:bg-blue-500")).toBe(
      "bg-red-500 md:bg-blue-500",
    );
    expect(cn("hover:bg-red-500", "hover:bg-blue-500")).toBe(
      "hover:bg-blue-500",
    );
    expect(cn("sm:p-4", "md:p-8", "lg:p-12")).toBe("sm:p-4 md:p-8 lg:p-12");
  });

  it("should handle undefined and null values", () => {
    expect(cn("class1", undefined, "class2")).toBe("class1 class2");
    expect(cn("class1", null, "class2")).toBe("class1 class2");
    expect(cn(undefined, null, "class1")).toBe("class1");
  });

  it("should handle boolean values", () => {
    expect(cn("class1", true && "class2", false && "class3")).toBe(
      "class1 class2",
    );
    expect(cn("base", true ? "active" : "inactive")).toBe("base active");
    expect(cn("base", false ? "active" : "inactive")).toBe("base inactive");
  });

  it("should handle complex conditional logic", () => {
    const isActive = true;
    const isDisabled = false;
    const size = "large" as "large" | "small";

    expect(
      cn("button", {
        "button--active": isActive,
        "button--disabled": isDisabled,
        "button--large": size === "large",
        "button--small": size === "small",
      }),
    ).toBe("button button--active button--large");
  });

  it("should handle whitespace and duplicate classes", () => {
    expect(cn("  class1  ", "  class2  ")).toBe("class1 class2");
    expect(cn("class1 class1", "class2")).toBe("class1 class1 class2"); // clsx preserves duplicates
    expect(cn("class1", "class1 class2")).toBe("class1 class1 class2"); // Duplicates preserved in this case
  });

  it("should handle very long class strings", () => {
    const longClasses =
      "bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-white font-bold py-2 px-4 rounded-full shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl";
    expect(cn(longClasses)).toBe(longClasses);
  });

  it("should handle nested arrays and objects", () => {
    expect(cn(["base", { active: true }, ["nested1", "nested2"]])).toBe(
      "base active nested1 nested2",
    );
  });

  it("should handle custom CSS classes mixed with Tailwind", () => {
    expect(cn("custom-class", "bg-red-500", "another-custom")).toBe(
      "custom-class bg-red-500 another-custom",
    );
  });

  it("should handle edge cases with special characters", () => {
    expect(cn("class-with-dashes", "class_with_underscores")).toBe(
      "class-with-dashes class_with_underscores",
    );
    expect(cn("class:with:colons", "class.with.dots")).toBe(
      "class:with:colons class.with.dots",
    );
  });

  it("should maintain order for non-conflicting classes", () => {
    expect(cn("z-10", "absolute", "top-0", "left-0")).toBe(
      "z-10 absolute top-0 left-0",
    );
  });

  it("should handle function return values", () => {
    const getClass = (condition: boolean) =>
      condition ? "active" : "inactive";
    expect(cn("base", getClass(true))).toBe("base active");
    expect(cn("base", getClass(false))).toBe("base inactive");
  });
});
