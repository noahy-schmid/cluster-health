export const e2eEnvironment = {
  databaseUrl:
    process.env.DATABASE_URL ??
    "postgresql://postgres:postgres@127.0.0.1:5432/deinsalon_e2e",
  manageBaseUrl: "http://127.0.0.1:3000",
  salonBaseUrl: process.env.SALON_URL ?? "http://127.0.0.1:3001",
  jwtSecret: process.env.JWT_SECRET ?? "deinsalon-playwright-test-secret",
  managementPassword:
    process.env.PLAYWRIGHT_MANAGEMENT_PASSWORD ?? "Playwright123!",
  nodeEnv: process.env.NODE_ENV ?? "test",
} as const;
