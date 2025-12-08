import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    AUTH_SECRET:
      process.env.NODE_ENV === "production"
        ? z
            .string()
            .min(32, "AUTH_SECRET must be at least 32 characters in production")
        : z
            .string()
            .min(8, "AUTH_SECRET must be at least 8 characters")
            .optional(),

    AUTH_DISCORD_ID:
      process.env.NODE_ENV === "production"
        ? z
            .string()
            .refine(
              (val) => val !== "placeholder" && val !== "test-discord-id",
              "AUTH_DISCORD_ID cannot be placeholder value",
            )
        : z.string().optional(),

    AUTH_DISCORD_SECRET:
      process.env.NODE_ENV === "production"
        ? z
            .string()
            .refine(
              (val) => val !== "placeholder" && val !== "test-discord-secret",
              "AUTH_DISCORD_SECRET cannot be placeholder value",
            )
        : z.string().optional(),

    DATABASE_URL:
      process.env.NODE_ENV === "production"
        ? z
            .string()
            .url()
            .refine(
              (val) => !val.includes("password@"),
              "DATABASE_URL should not contain weak passwords",
            )
        : z.string().url(),

    // Add Sentry validation
    SENTRY_DSN: z.string().url().optional(),
    SENTRY_ORG: z.string().optional(),
    SENTRY_PROJECT: z.string().optional(),

    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    // NEXT_PUBLIC_CLIENTVAR: z.string(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    AUTH_SECRET: process.env.AUTH_SECRET,
    AUTH_DISCORD_ID: process.env.AUTH_DISCORD_ID,
    AUTH_DISCORD_SECRET: process.env.AUTH_DISCORD_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    SENTRY_DSN: process.env.SENTRY_DSN,
    SENTRY_ORG: process.env.SENTRY_ORG,
    SENTRY_PROJECT: process.env.SENTRY_PROJECT,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
