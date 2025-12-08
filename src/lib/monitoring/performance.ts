import * as Sentry from "@sentry/nextjs";

import { Logger } from "./logger";

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: "ms" | "bytes" | "count";
  tags?: Record<string, string>;
}

export class PerformanceMonitor {
  private static timers = new Map<string, number>();

  // Start timing an operation
  static startTimer(operationName: string): string {
    const timerId = `${operationName}-${Date.now()}-${Math.random()}`;
    this.timers.set(timerId, performance.now());
    return timerId;
  }

  // End timing and log the result
  static endTimer(timerId: string, context?: Record<string, unknown>) {
    const startTime = this.timers.get(timerId);
    if (!startTime) {
      Logger.warn("Timer not found", { timerId });
      return 0;
    }

    const duration = performance.now() - startTime;
    this.timers.delete(timerId);

    const operationName = timerId.split("-")[0];

    // Log performance metric
    Logger.info(`Performance: ${operationName}`, {
      duration: Math.round(duration),
      operation: operationName,
      ...context,
    });

    // Alert on slow operations - configurable thresholds
    const thresholds = {
      "database-query": 500,
      "api-request": 1000,
      "file-upload": 5000,
      default: 1000,
    };

    const threshold =
      thresholds[operationName as keyof typeof thresholds] ??
      thresholds.default;

    // Only send critical performance data to Sentry
    if (process.env.NODE_ENV === "production") {
      // Only capture slow operations as events (saves quota)
      if (duration > threshold) {
        Sentry.captureMessage(
          `Slow operation: ${operationName} (${Math.round(duration)}ms)`,
          "warning",
        );
      }

      // Sample 5% of normal operations for breadcrumbs
      if (Math.random() < 0.05) {
        Sentry.addBreadcrumb({
          category: "performance",
          message: `${operationName} completed`,
          level: "info",
          data: {
            duration: Math.round(duration),
            operation: operationName,
          },
        });
      }
    }

    if (duration > threshold) {
      Logger.warn(`Slow operation detected: ${operationName}`, {
        duration: Math.round(duration),
        threshold,
        ...context,
      });
    }

    return Math.round(duration);
  }

  // Track custom metrics
  static trackMetric(metric: PerformanceMetric) {
    Logger.info(`Metric: ${metric.name}`, {
      value: metric.value,
      unit: metric.unit,
      ...metric.tags,
    });

    // Only send high-value metrics to Sentry
    if (process.env.NODE_ENV === "production" && metric.value > 0) {
      // Only sample 10% of metrics
      if (Math.random() < 0.1) {
        Sentry.addBreadcrumb({
          category: "metric",
          message: `${metric.name}: ${metric.value}${metric.unit}`,
          level: "info",
          data: metric,
        });
      }
    }
  }

  // Convenience method for timing async operations
  static async timeAsync<T>(
    operationName: string,
    operation: () => Promise<T>,
    context?: Record<string, unknown>,
  ): Promise<T> {
    const timerId = this.startTimer(operationName);
    try {
      const result = await operation();
      this.endTimer(timerId, { ...context, success: true });
      return result;
    } catch (error) {
      this.endTimer(timerId, {
        ...context,
        success: false,
        error: String(error),
      });
      throw error;
    }
  }
}
