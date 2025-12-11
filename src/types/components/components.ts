import type { ErrorInfo, ReactNode } from "react";

// Component Types
export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export interface ApiErrorBoundaryProps {
  children: ReactNode;
}
