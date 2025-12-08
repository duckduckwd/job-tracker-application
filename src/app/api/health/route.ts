import { NextResponse } from "next/server";

import { Logger } from "~/lib/monitoring/logger";
import { PerformanceMonitor } from "~/lib/monitoring/performance";
import { db } from "~/server/db";

export async function GET() {
  const startTime = Date.now();

  try {
    // Check database connectivity
    const dbCheck = await PerformanceMonitor.timeAsync(
      "health-check-db",
      async () => {
        await db.$queryRaw`SELECT 1`;
        return { status: "healthy" };
      },
    );

    // Check environment variables
    const envCheck = {
      status: process.env.DATABASE_URL ? "healthy" : "unhealthy",
      message: process.env.DATABASE_URL
        ? "All required env vars present"
        : "Missing DATABASE_URL",
    };

    const totalTime = Date.now() - startTime;
    const isHealthy =
      dbCheck.status === "healthy" && envCheck.status === "healthy";

    const healthData = {
      status: isHealthy ? "healthy" : "unhealthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      responseTime: totalTime,
      checks: {
        database: dbCheck,
        environment: envCheck,
      },
      version: process.env.npm_package_version ?? "1.0.0",
    };

    Logger.debug("Health check completed", {
      status: healthData.status,
      responseTime: totalTime,
    });

    return NextResponse.json(healthData, {
      status: isHealthy ? 200 : 503,
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    Logger.error("Health check failed", {
      error: error instanceof Error ? error.message : String(error),
      responseTime: Date.now() - startTime,
    });

    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: "Health check failed",
        responseTime: Date.now() - startTime,
      },
      { status: 503 },
    );
  }
}
