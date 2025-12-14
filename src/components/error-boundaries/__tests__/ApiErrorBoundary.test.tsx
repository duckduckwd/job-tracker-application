import { render, screen } from "@testing-library/react";

import { ApiErrorBoundary } from "../ApiErrorBoundary";

const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error("API error");
  }
  return <div>API data loaded</div>;
};

describe("ApiErrorBoundary", () => {
  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    (console.error as jest.Mock).mockRestore();
  });

  it("renders children when no error occurs", () => {
    render(
      <ApiErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ApiErrorBoundary>,
    );

    expect(screen.getByText("API data loaded")).toBeInTheDocument();
  });

  it("renders API-specific error UI when error occurs", () => {
    render(
      <ApiErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ApiErrorBoundary>,
    );

    expect(screen.getByText("Unable to load data")).toBeInTheDocument();
    expect(
      screen.getByText(/There was a problem loading the requested information/),
    ).toBeInTheDocument();
  });

  it("renders error icon in fallback UI", () => {
    render(
      <ApiErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ApiErrorBoundary>,
    );

    const errorIcon = document.querySelector("svg");
    expect(errorIcon).toHaveClass("h-5 w-5 text-red-400");
  });

  it("applies correct styling classes", () => {
    render(
      <ApiErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ApiErrorBoundary>,
    );

    const errorContainer = screen
      .getByText("Unable to load data")
      .closest("div");
    expect(errorContainer?.parentElement?.parentElement).toHaveClass(
      "rounded-lg border border-red-200 bg-red-50 p-4",
    );
  });

  it("handles multiple children", () => {
    render(
      <ApiErrorBoundary>
        <div>First child</div>
        <div>Second child</div>
        <ThrowError shouldThrow={false} />
      </ApiErrorBoundary>,
    );

    expect(screen.getByText("First child")).toBeInTheDocument();
    expect(screen.getByText("Second child")).toBeInTheDocument();
    expect(screen.getByText("API data loaded")).toBeInTheDocument();
  });

  it("handles error in one of multiple children", () => {
    render(
      <ApiErrorBoundary>
        <div>Working component</div>
        <ThrowError shouldThrow={true} />
      </ApiErrorBoundary>,
    );

    expect(screen.getByText("Unable to load data")).toBeInTheDocument();
    expect(screen.queryByText("Working component")).not.toBeInTheDocument();
  });

  it("wraps ErrorBoundary with correct props", () => {
    const { container } = render(
      <ApiErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ApiErrorBoundary>,
    );

    // Verify the structure includes the API-specific fallback
    expect(container.querySelector(".border-red-200")).toBeInTheDocument();
    expect(container.querySelector(".bg-red-50")).toBeInTheDocument();
  });
});
