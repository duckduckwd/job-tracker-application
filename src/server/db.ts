import { env } from "~/env";

import { PrismaClient } from "../../generated/prisma";

const createPrismaClient = () =>
  new PrismaClient({
    log:
      env.NODE_ENV === "development"
        ? ["query", "error", "warn", "info"]
        : ["error", "warn"],

    // Security enhancements
    errorFormat: env.NODE_ENV === "production" ? "minimal" : "pretty",
  });

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

// Add after: export const db = globalForPrisma.prisma ?? createPrismaClient();

// Validate database connection on startup
if (env.NODE_ENV === "production") {
  db.$connect()
    .then(() => console.log("✅ Database connected securely"))
    .catch((error: unknown) => {
      const message = error instanceof Error ? error.message : String(error);
      console.error("❌ Database connection failed:", message);
      process.exit(1);
    });
}
