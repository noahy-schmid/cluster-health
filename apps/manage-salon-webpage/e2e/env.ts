const defaultDatabaseUrl =
  "postgresql://postgres:postgres@127.0.0.1:5432/deinsalon_e2e";
const defaultManageBaseUrl = "http://127.0.0.1:3000";
const defaultSalonBaseUrl = "http://127.0.0.1:3001";
const defaultJwtSecret = "deinsalon-playwright-test-secret";
const defaultManagementPassword = "Playwright123!";

export const e2eEnvironment = {
  databaseUrl: process.env.DATABASE_URL ?? defaultDatabaseUrl,
  manageBaseUrl: defaultManageBaseUrl,
  salonBaseUrl: process.env.SALON_URL ?? defaultSalonBaseUrl,
  jwtSecret: process.env.JWT_SECRET ?? defaultJwtSecret,
  managementPassword:
    process.env.PLAYWRIGHT_MANAGEMENT_PASSWORD ?? defaultManagementPassword,
  nodeEnv: process.env.NODE_ENV ?? "test",
} as const;
