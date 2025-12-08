// Monitoring Types
export interface LogContext {
  userId?: string;
  requestId?: string;
  ip?: string;
  userAgent?: string;
  duration?: number;
  [key: string]: unknown;
}

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: "ms" | "bytes" | "count";
  tags?: Record<string, string>;
}
