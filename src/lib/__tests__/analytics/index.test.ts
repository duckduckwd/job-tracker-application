// Mock fetch
global.fetch = jest.fn();

// Mock window.va
const mockVa = jest.fn();

// Setup jsdom environment with window.va
Object.defineProperty(window, "va", {
  value: mockVa,
  writable: true,
  configurable: true,
});

// Import after mocking
import { analytics } from "../../analytics/index";

describe("Analytics", () => {
  const mockFetch = fetch as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockResolvedValue({ ok: true });
    mockVa.mockClear();
  });

  describe("track", () => {
    it("tracks events in production", () => {
      jest.replaceProperty(process, "env", {
        ...process.env,
        NODE_ENV: "production" as const,
      });

      const event = {
        name: "button_click",
        properties: { button_id: "submit" },
      };

      analytics.track(event);

      expect(mockVa).toHaveBeenCalledWith("track", "button_click", {
        button_id: "submit",
      });
      expect(mockFetch).toHaveBeenCalledWith("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: expect.stringContaining('"name":"button_click"'),
      });
    });

    it("does not track events in development", () => {
      jest.replaceProperty(process, "env", {
        ...process.env,
        NODE_ENV: "development" as const,
      });

      const event = {
        name: "button_click",
        properties: { button_id: "submit" },
      };

      analytics.track(event);

      expect(mockVa).not.toHaveBeenCalled();
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("handles events without properties", () => {
      jest.replaceProperty(process, "env", {
        ...process.env,
        NODE_ENV: "production" as const,
      });

      const event = { name: "page_load" };

      analytics.track(event);

      expect(mockVa).toHaveBeenCalledWith("track", "page_load", undefined);
    });

    it("handles events with userId", () => {
      jest.replaceProperty(process, "env", {
        ...process.env,
        NODE_ENV: "production" as const,
      });

      const event = {
        name: "user_action",
        userId: "user123",
        properties: { action: "click" },
      };

      analytics.track(event);

      expect(mockFetch).toHaveBeenCalledWith("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: expect.stringContaining('"name":"user_action"'),
      });

      const fetchCall = mockFetch.mock.calls[0][1];
      const body = JSON.parse(fetchCall.body);
      expect(body).toMatchObject({
        name: "user_action",
        userId: "user123",
        properties: { action: "click" },
      });
      expect(body.timestamp).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
      );
      expect(body.url).toBeDefined();
      expect(body.userAgent).toBeDefined();
    });

    it("fails silently when fetch fails", () => {
      jest.replaceProperty(process, "env", {
        ...process.env,
        NODE_ENV: "production" as const,
      });
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const event = { name: "test_event" };

      expect(() => {
        analytics.track(event);
      }).not.toThrow();
    });

    it("works when window.va is not available", () => {
      jest.replaceProperty(process, "env", {
        ...process.env,
        NODE_ENV: "production" as const,
      });
      delete (window as any).va;

      const event = { name: "test_event" };

      expect(() => {
        analytics.track(event);
      }).not.toThrow();

      expect(mockFetch).toHaveBeenCalled();

      // Restore va for other tests
      (window as any).va = mockVa;
    });
  });

  describe("page", () => {
    it("tracks page views with path", () => {
      jest.replaceProperty(process, "env", {
        ...process.env,
        NODE_ENV: "production" as const,
      });

      analytics.page("/dashboard");

      expect(mockVa).toHaveBeenCalledWith("track", "page_view", {
        path: "/dashboard",
      });
    });

    it("tracks page views with additional properties", () => {
      jest.replaceProperty(process, "env", {
        ...process.env,
        NODE_ENV: "production" as const,
      });

      analytics.page("/dashboard", { section: "analytics" });

      expect(mockVa).toHaveBeenCalledWith("track", "page_view", {
        path: "/dashboard",
        section: "analytics",
      });
    });

    it("does not track in development", () => {
      jest.replaceProperty(process, "env", {
        ...process.env,
        NODE_ENV: "development" as const,
      });

      analytics.page("/dashboard");

      expect(mockVa).not.toHaveBeenCalled();
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe("identify", () => {
    it("identifies users in production", () => {
      jest.replaceProperty(process, "env", {
        ...process.env,
        NODE_ENV: "production" as const,
      });

      analytics.identify("user123", {
        name: "John Doe",
        email: "john@example.com",
      });

      expect(mockVa).toHaveBeenCalledWith("track", "user_identify", {
        name: "John Doe",
        email: "john@example.com",
      });

      expect(mockFetch).toHaveBeenCalledWith("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: expect.stringContaining('"name":"user_identify"'),
      });

      const fetchCall = mockFetch.mock.calls[0][1];
      const body = JSON.parse(fetchCall.body);
      expect(body).toMatchObject({
        name: "user_identify",
        userId: "user123",
        properties: { name: "John Doe", email: "john@example.com" },
      });
      expect(body.timestamp).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
      );
      expect(body.url).toBeDefined();
      expect(body.userAgent).toBeDefined();
    });

    it("identifies users without traits", () => {
      jest.replaceProperty(process, "env", {
        ...process.env,
        NODE_ENV: "production" as const,
      });

      analytics.identify("user123");

      expect(mockVa).toHaveBeenCalledWith("track", "user_identify", undefined);
    });

    it("does not identify in development", () => {
      jest.replaceProperty(process, "env", {
        ...process.env,
        NODE_ENV: "development" as const,
      });

      analytics.identify("user123");

      expect(mockVa).not.toHaveBeenCalled();
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe("sendCustomEvent", () => {
    it("includes timestamp, url, and userAgent", () => {
      jest.replaceProperty(process, "env", {
        ...process.env,
        NODE_ENV: "production" as const,
      });

      const event = { name: "custom_event" };
      analytics.track(event);

      expect(mockFetch).toHaveBeenCalledWith("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: expect.stringContaining('"name":"custom_event"'),
      });

      const fetchCall = mockFetch.mock.calls[0][1];
      const body = JSON.parse(fetchCall.body);
      expect(body).toMatchObject({
        name: "custom_event",
      });
      expect(body.timestamp).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
      );
      expect(body.url).toBeDefined();
      expect(body.userAgent).toBeDefined();
    });

    it("handles complex event properties", () => {
      jest.replaceProperty(process, "env", {
        ...process.env,
        NODE_ENV: "production" as const,
      });

      const event = {
        name: "complex_event",
        properties: {
          nested: { value: 123 },
          array: [1, 2, 3],
          boolean: true,
          null_value: null,
        },
      };

      analytics.track(event);

      expect(mockFetch).toHaveBeenCalledWith("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: expect.stringContaining('"name":"complex_event"'),
      });

      const fetchCall = mockFetch.mock.calls[0][1];
      const body = JSON.parse(fetchCall.body);
      expect(body).toMatchObject({
        name: "complex_event",
        properties: {
          nested: { value: 123 },
          array: [1, 2, 3],
          boolean: true,
          null_value: null,
        },
      });
      expect(body.timestamp).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
      );
      expect(body.url).toBeDefined();
      expect(body.userAgent).toBeDefined();
    });
  });

  describe("environment detection", () => {
    it("correctly identifies production environment", () => {
      jest.replaceProperty(process, "env", {
        ...process.env,
        NODE_ENV: "production" as const,
      });

      analytics.track({ name: "test" });

      expect(mockVa).toHaveBeenCalled();
      expect(mockFetch).toHaveBeenCalled();
    });

    it("correctly identifies non-production environments", () => {
      const environments = ["development", "test", "staging"];

      for (const env of environments) {
        jest.clearAllMocks();
        jest.replaceProperty(process, "env", {
          ...process.env,
          NODE_ENV: env as any,
        });

        analytics.track({ name: "test" });

        expect(mockVa).not.toHaveBeenCalled();
        expect(mockFetch).not.toHaveBeenCalled();
      }
    });
  });
});
