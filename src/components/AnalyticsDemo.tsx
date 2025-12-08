"use client";

import { analytics } from "~/lib/analytics/index";

export function AnalyticsDemo() {
  const handleButtonClick = (action: string) => {
    analytics.track({
      name: "demo_button_clicked",
      properties: {
        action,
        timestamp: new Date().toISOString(),
      },
    });
  };

  const handleUserIdentify = () => {
    analytics.identify("demo-user-123", {
      name: "Demo User",
      plan: "free",
      source: "demo",
    });
  };

  return (
    <div className="rounded-lg bg-white/10 p-6">
      <h3 className="mb-4 text-xl font-bold">Analytics Demo</h3>
      <div className="space-y-3">
        <button
          onClick={() => handleButtonClick("first_steps")}
          className="block w-full rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          Track: First Steps Click
        </button>
        <button
          onClick={() => handleButtonClick("documentation")}
          className="block w-full rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
        >
          Track: Documentation Click
        </button>
        <button
          onClick={handleUserIdentify}
          className="block w-full rounded bg-purple-500 px-4 py-2 text-white hover:bg-purple-600"
        >
          Track: User Identify
        </button>
      </div>
      <p className="mt-4 text-sm text-gray-300">
        Open browser console to see analytics events in development mode
      </p>
    </div>
  );
}
