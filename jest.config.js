import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironment: "jest-environment-jsdom",
  testEnvironmentOptions: {
    customExportConditions: [""],
  },
  setupFiles: ["<rootDir>/jest.env.js"],
  moduleNameMapper: {
    "^~/(.*)$": "<rootDir>/src/$1",
  },
  testMatch: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(test).[jt]s?(x)"],
  testPathIgnorePatterns: [
    "/node_modules/",
    "/.next/",
    "/e2e/",
    "\\.spec\\.[jt]sx?$",
  ],
  watchPathIgnorePatterns: [
    "/node_modules/",
    "/.next/",
    "/coverage/",
    "/docs/",
    "/generated/",
    "\\.git/",
  ],
  collectCoverage: true,
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/*.stories.{js,jsx,ts,tsx}",
    "!src/pages/_app.tsx",
    "!src/pages/_document.tsx",
    // Configuration and environment files
    "!src/env.js",
    "!src/instrumentation.ts",
    "!src/instrumentation-client.ts",
    // Demo and example files
    "!src/app/sentry-example-page/**",
    "!src/app/design-examples/**",
    "!src/components/demo/**",
    "!src/app/api/sentry-example-api/**",
    // Type definition files (non-logic)
    "!src/types/analytics.ts",
    "!src/types/monitoring.ts",
    "!src/types/security.ts",
    "!src/types/components/**",
    // Index/export files (re-exports only)
    "!src/components/index.ts",
    "!src/services/index.ts",
    "!src/constants/index.ts",
    "!src/features/**/index.ts",
    "!src/utils/index.ts",
    "!src/schemas/index.ts",
    "!src/server/auth/index.ts",
    "!src/types/index.ts",
    "!**/index.ts",
    // Static configuration files
    "!src/config/forms/form-sections.config.ts",
    "!src/config/forms/job-application-fields.config.ts",
    "!src/server/**",
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  coverageReporters: ["text", "lcov", "html"],
};

export default createJestConfig(customJestConfig);
