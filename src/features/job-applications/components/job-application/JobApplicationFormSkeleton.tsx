import { memo } from "react";

import { Card } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";

export const JobApplicationFormSkeleton = memo(() => (
  <Card className="mx-auto w-full max-w-4xl p-6">
    <Skeleton className="mx-auto mb-6 h-8 w-64" />

    <div className="space-y-6">
      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>

      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>

      <Skeleton className="h-12 w-full" />
    </div>
  </Card>
));

JobApplicationFormSkeleton.displayName = "JobApplicationFormSkeleton";
