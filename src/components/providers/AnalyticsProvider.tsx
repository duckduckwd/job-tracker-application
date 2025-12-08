"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { analytics } from "~/lib/analytics/index";

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    // Track page views
    analytics.page(pathname);
  }, [pathname]);

  return <>{children}</>;
}
