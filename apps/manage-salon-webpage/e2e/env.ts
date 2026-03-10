const defaultDatabaseUrl =
  "postgresql://postgres:postgres@127.0.0.1:5432/deinsalon_e2e";
const defaultManageBaseUrl = "http://127.0.0.1:3000";
const defaultSalonBaseUrl = "http://127.0.0.1:3001";
const defaultJwtSecret = "deinsalon-playwright-test-secret";

export const e2eEnvironment = {
  databaseUrl: process.env.DATABASE_URL ?? defaultDatabaseUrl,
  manageBaseUrl: process.env.MANAGE_SALON_URL ?? defaultManageBaseUrl,
  salonBaseUrl: process.env.SALON_URL ?? defaultSalonBaseUrl,
  jwtSecret: process.env.JWT_SECRET ?? defaultJwtSecret,
  nodeEnv: process.env.NODE_ENV ?? "test",
} as const;

process.env.DATABASE_URL = e2eEnvironment.databaseUrl;
process.env.SALON_URL = e2eEnvironment.salonBaseUrl;
process.env.JWT_SECRET = e2eEnvironment.jwtSecret;
process.env.NODE_ENV = e2eEnvironment.nodeEnv;
