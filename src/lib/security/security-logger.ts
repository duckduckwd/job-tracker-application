import { Logger } from "../monitoring/logger";

export class SecurityLogger {
  static logRateLimit(ip: string, pathname: string) {
    Logger.warn("Rate limit exceeded", {
      ip,
      pathname,
      timestamp: new Date().toISOString(),
    });
  }
}
