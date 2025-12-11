import { memo } from "react";

export const ErrorAlert = memo(
  ({ error, onDismiss }: { error: string; onDismiss: () => void }) => (
    <div
      className="mb-4 rounded-md border border-red-200 bg-red-50 p-4"
      role="alert"
      aria-live="polite"
      aria-atomic
    >
      <div className="flex">
        <div className="text-sm text-red-700">
          <p>{error}</p>
          <button
            className="mt-2 text-red-600 underline hover:text-red-500"
            type="button"
            onClick={onDismiss}
            aria-describedby="error-message"
            aria-label={`Dismiss error: ${error}`}
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  ),
);

ErrorAlert.displayName = "ErrorAlert";
