import { memo } from "react";

interface AutoSaveIndicatorProps {
  isDirty: boolean;
  className?: string;
}

export const AutoSaveIndicator = memo(
  ({ isDirty, className = "" }: AutoSaveIndicatorProps) => (
    <div
      className={`text-sm text-white/70 ${className}`}
      aria-live="polite"
      aria-atomic="true"
      role="status"
    >
      {isDirty ? "Draft saved automatically" : ""}
    </div>
  ),
);

AutoSaveIndicator.displayName = "AutoSaveIndicator";
