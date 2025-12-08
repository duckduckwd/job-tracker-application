// Load test environment variables
process.env.AUTH_SECRET = "test-secret-key";
process.env.AUTH_DISCORD_ID = "test-discord-id";
process.env.AUTH_DISCORD_SECRET = "test-discord-secret";
process.env.DATABASE_URL =
  "postgresql://postgres:password@localhost:5432/job-application-tracker-test";
