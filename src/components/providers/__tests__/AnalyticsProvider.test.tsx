import { render, screen } from "@testing-library/react";
import { usePathname } from "next/navigation";

import { analytics } from "~/lib/analytics/index";

import { AnalyticsProvider } from "../AnalyticsProvider";

// Mock Next.js navigation
jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

// Mock analytics
jest.mock("~/lib/analytics/index", () => ({
  analytics: {
    page: jest.fn(),
  },
}));

describe("AnalyticsProvider", () => {
  const mockUsePathname = usePathname as jest.Mock;
  const mockAnalyticsPage = analytics.page as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders children without modification", () => {
    mockUsePathname.mockReturnValue("/test-path");

    const { container } = render(
      <AnalyticsProvider>
        <div data-testid="child">Test content</div>
      </AnalyticsProvider>,
    );

    expect(container.firstChild).toMatchInlineSnapshot(`
      <div
        data-testid="child"
      >
        Test content
      </div>
    `);
  });

  it("tracks page view on mount", () => {
    mockUsePathname.mockReturnValue("/dashboard");

    render(
      <AnalyticsProvider>
        <div>Content</div>
      </AnalyticsProvider>,
    );

    expect(mockAnalyticsPage).toHaveBeenCalledWith("/dashboard");
    expect(mockAnalyticsPage).toHaveBeenCalledTimes(1);
  });

  it("tracks page view when pathname changes", () => {
    mockUsePathname.mockReturnValue("/initial-path");

    const { rerender } = render(
      <AnalyticsProvider>
        <div>Content</div>
      </AnalyticsProvider>,
    );

    expect(mockAnalyticsPage).toHaveBeenCalledWith("/initial-path");

    // Simulate pathname change
    mockUsePathname.mockReturnValue("/new-path");

    rerender(
      <AnalyticsProvider>
        <div>Content</div>
      </AnalyticsProvider>,
    );

    expect(mockAnalyticsPage).toHaveBeenCalledWith("/new-path");
    expect(mockAnalyticsPage).toHaveBeenCalledTimes(2);
  });

  it("handles root path correctly", () => {
    mockUsePathname.mockReturnValue("/");

    render(
      <AnalyticsProvider>
        <div>Home content</div>
      </AnalyticsProvider>,
    );

    expect(mockAnalyticsPage).toHaveBeenCalledWith("/");
  });

  it("handles complex paths with parameters", () => {
    mockUsePathname.mockReturnValue("/job-applications/123/edit");

    render(
      <AnalyticsProvider>
        <div>Edit form</div>
      </AnalyticsProvider>,
    );

    expect(mockAnalyticsPage).toHaveBeenCalledWith(
      "/job-applications/123/edit",
    );
  });

  it("handles multiple children", () => {
    mockUsePathname.mockReturnValue("/test");

    render(
      <AnalyticsProvider>
        <div>First child</div>
        <div>Second child</div>
        <span>Third child</span>
      </AnalyticsProvider>,
    );

    expect(mockAnalyticsPage).toHaveBeenCalledWith("/test");
    expect(mockAnalyticsPage).toHaveBeenCalledTimes(1);
  });

  it("calls analytics page tracking", () => {
    mockUsePathname.mockReturnValue("/test-path");

    render(
      <AnalyticsProvider>
        <div>Content</div>
      </AnalyticsProvider>,
    );

    expect(mockAnalyticsPage).toHaveBeenCalledWith("/test-path");
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("handles rapid pathname changes", () => {
    mockUsePathname.mockReturnValue("/path1");

    const { rerender } = render(
      <AnalyticsProvider>
        <div>Content</div>
      </AnalyticsProvider>,
    );

    // Simulate rapid navigation
    mockUsePathname.mockReturnValue("/path2");
    rerender(
      <AnalyticsProvider>
        <div>Content</div>
      </AnalyticsProvider>,
    );

    mockUsePathname.mockReturnValue("/path3");
    rerender(
      <AnalyticsProvider>
        <div>Content</div>
      </AnalyticsProvider>,
    );

    expect(mockAnalyticsPage).toHaveBeenCalledTimes(3);
    expect(mockAnalyticsPage).toHaveBeenNthCalledWith(1, "/path1");
    expect(mockAnalyticsPage).toHaveBeenNthCalledWith(2, "/path2");
    expect(mockAnalyticsPage).toHaveBeenNthCalledWith(3, "/path3");
  });

  it("handles empty pathname", () => {
    mockUsePathname.mockReturnValue("");

    render(
      <AnalyticsProvider>
        <div>Content</div>
      </AnalyticsProvider>,
    );

    expect(mockAnalyticsPage).toHaveBeenCalledWith("");
  });

  it("handles pathname with query parameters and fragments", () => {
    // Note: usePathname only returns the pathname, not query params or fragments
    mockUsePathname.mockReturnValue("/search");

    render(
      <AnalyticsProvider>
        <div>Search results</div>
      </AnalyticsProvider>,
    );

    expect(mockAnalyticsPage).toHaveBeenCalledWith("/search");
  });

  it("does not track same pathname multiple times without change", () => {
    mockUsePathname.mockReturnValue("/same-path");

    const { rerender } = render(
      <AnalyticsProvider>
        <div>Content</div>
      </AnalyticsProvider>,
    );

    // Rerender without pathname change
    rerender(
      <AnalyticsProvider>
        <div>Updated content</div>
      </AnalyticsProvider>,
    );

    // Should only be called once since pathname didn't change
    expect(mockAnalyticsPage).toHaveBeenCalledTimes(1);
  });
});
