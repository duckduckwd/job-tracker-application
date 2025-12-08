import * as Sentry from "@sentry/nextjs";

import { PERFORMANCE } from "~/constants";
import type { PerformanceMetric } from "~/types";

import { Logger } from "./logger";

export class PerformanceMonitor {
  private static readonly timers = new Map<string, number>();

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
      "database-query": PERFORMANCE.THRESHOLDS.DATABASE_QUERY,
      "api-request": PERFORMANCE.THRESHOLDS.API_REQUEST,
      "file-upload": PERFORMANCE.THRESHOLDS.FILE_UPLOAD,
      default: PERFORMANCE.THRESHOLDS.DEFAULT,
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

      // Sample normal operations for breadcrumbs
      if (Math.random() < PERFORMANCE.SENTRY_SAMPLE_RATE) {
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
      // Only sample metrics
      if (Math.random() < PERFORMANCE.METRICS_SAMPLE_RATE) {
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
