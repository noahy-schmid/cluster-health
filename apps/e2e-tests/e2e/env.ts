export const e2eEnvironment = {
  databaseUrl:
    process.env.DATABASE_URL ??
    "postgresql://postgres:postgres@127.0.0.1:5432/deinsalon_e2e",
  manageBaseUrl: "http://127.0.0.1:3000",
  salonBaseUrl: process.env.SALON_URL ?? "http://127.0.0.1:3001",
  s3Url: process.env.S3_URL ?? "http://127.0.0.1:9000",
  s3AccessKey: process.env.S3_SALON_ACCESS_KEY ?? "minioadmin",
  s3SecretKey: process.env.S3_SALON_SECRET_KEY ?? "minioadmin",
  s3BucketName: process.env.S3_WEBSITE_BUCKET_NAME ?? "salon-media",
  jwtSecret: process.env.JWT_SECRET ?? "deinsalon-playwright-test-secret",
  managementPassword:
    process.env.PLAYWRIGHT_MANAGEMENT_PASSWORD ?? "Playwright123!",
  nodeEnv: process.env.NODE_ENV ?? "test",
} as const;
