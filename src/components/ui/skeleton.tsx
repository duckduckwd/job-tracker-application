import { memo } from "react";

interface SkeletonProps {
  className?: string;
}

export const Skeleton = memo(({ className = "" }: SkeletonProps) => (
  <div className={`${className} animate-pulse rounded-md bg-white/20`} />
));

Skeleton.displayName = "Skeleton";
