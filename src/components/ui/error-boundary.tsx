"use client";

import { Component, type ErrorInfo } from "react";

import type { Props, State } from "~/types/components/error-boundary";

class ErrorBoundaryClass extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("ApplicationDetails Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="mx-auto w-full max-w-4xl rounded-lg border border-red-200 bg-red-50 p-6">
            <div
              className="mb-2 text-lg font-semibold text-red-700"
              role="heading"
              aria-level={2}
            >
              Something went wrong
            </div>
            <p className="text-red-600">
              Unable to load the Add Application Details form. Please refresh
              the page.
            </p>
          </div>
        )
      );
    }
    return this.props.children;
  }
}

export const ErrorBoundary = ({ children, fallback }: Props) => (
  <ErrorBoundaryClass fallback={fallback}>{children}</ErrorBoundaryClass>
);
