// Analytics Types
export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, unknown>;
  userId?: string;
  timestamp?: string;
  url?: string;
  userAgent?: string;
}

// Global Window Extensions
declare global {
  interface Window {
    va?: (
      action: string,
      name: string,
      properties?: Record<string, unknown>,
    ) => void;
  }
}
