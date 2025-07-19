/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  // Force sequential execution for database tests to avoid collection conflicts
  maxWorkers: 1,
  testMatch: ["**/db/__tests__/**/*.test.ts"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
  collectCoverageFrom: ["src/**/*.{ts,js}", "!src/**/*.d.ts"],
  testTimeout: 30000, // 30 second timeout for database operations
};
