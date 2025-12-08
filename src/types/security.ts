// Security Types
export interface SecurityEvent {
  type: "auth_failure" | "rate_limit" | "suspicious_request" | "data_access";
  userId?: string;
  ip?: string;
  userAgent?: string;
  details: Record<string, unknown>;
}
