import { type NextRequest, NextResponse } from "next/server";

interface AnalyticsEvent {
  name: string;
  properties?: Record<string, unknown>;
  userId?: string;
  timestamp?: string;
  url?: string;
  userAgent?: string;
}

export async function POST(request: NextRequest) {
  try {
    const event = (await request.json()) as AnalyticsEvent;

    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.warn("📊 Analytics Event:", event);
    }

    // In production, you could store in database or send to external service
    // For now, just return success
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to track event" },
      { status: 500 },
    );
  }
}
