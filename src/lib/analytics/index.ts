import type { AnalyticsEvent } from "~/types";

class Analytics {
  private readonly isEnabled: boolean;

  constructor() {
    this.isEnabled = process.env.NODE_ENV === "production";
  }

  track(event: AnalyticsEvent) {
    if (!this.isEnabled) return;

    // Vercel Analytics
    if (typeof window !== "undefined" && window.va) {
      window.va("track", event.name, event.properties);
    }

    // Custom analytics
    this.sendCustomEvent(event);
  }

  page(path: string, properties?: Record<string, unknown>) {
    this.track({
      name: "page_view",
      properties: {
        path,
        ...properties,
      },
    });
  }

  identify(userId: string, traits?: Record<string, unknown>) {
    if (!this.isEnabled) return;

    this.track({
      name: "user_identify",
      userId,
      properties: traits,
    });
  }

  private sendCustomEvent(event: AnalyticsEvent) {
    // Send to your custom analytics endpoint
    fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...event,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      }),
    }).catch(() => {
      // Fail silently
    });
  }
}

export const analytics = new Analytics();
