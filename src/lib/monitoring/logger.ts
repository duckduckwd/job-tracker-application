import * as Sentry from "@sentry/nextjs";

import type { LogContext, LogLevel } from "~/types";

export class Logger {
  private static generateRequestId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  static log(level: LogLevel, message: string, context: LogContext = {}) {
    const logData = {
      timestamp: new Date().toISOString(),
      level,
      message,
      requestId: context.requestId ?? this.generateRequestId(),
      ...context,
    };

    // Console logging with colors
    if (process.env.NODE_ENV === "development") {
      const colors = {
        debug: "\x1b[36m", // cyan
        info: "\x1b[32m", // green
        warn: "\x1b[33m", // yellow
        error: "\x1b[31m", // red
      };
      console.log(`${colors[level]}[${level.toUpperCase()}]\x1b[0m`, logData);
    }

    // Send to Sentry
    Sentry.addBreadcrumb({
      category: "app",
      message,
      level: level === "error" ? "error" : "info",
      data: logData,
    });

    // Capture errors in Sentry
    if (level === "error") {
      Sentry.captureMessage(message, "error");
    }
  }

  static debug(message: string, context?: LogContext) {
    this.log("debug", message, context);
  }

  static info(message: string, context?: LogContext) {
    this.log("info", message, context);
  }

  static warn(message: string, context?: LogContext) {
    this.log("warn", message, context);
  }

  static error(message: string, context?: LogContext) {
    this.log("error", message, context);
  }
}
