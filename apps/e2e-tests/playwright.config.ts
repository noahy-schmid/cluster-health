import { defineConfig, devices } from "@playwright/test";
import path from "path";
import { e2eEnvironment } from "./e2e/env";

const repositoryRoot = path.resolve(__dirname, "../..");
const htmlReporter = ["html", { open: "never" }] as const;
const minioCommand = [
  "docker rm -f deinsalon-e2e-minio >/dev/null 2>&1 || true",
  [
    "docker run --rm --name deinsalon-e2e-minio",
    "-p 9000:9000 -p 9001:9001",
    `-e MINIO_ROOT_USER=${e2eEnvironment.s3AccessKey}`,
    `-e MINIO_ROOT_PASSWORD=${e2eEnvironment.s3SecretKey}`,
    "minio/minio:latest server /data --console-address :9001",
  ].join(" "),
].join(" && ");
const prepareManageAppCommand = [
  "corepack enable",
  "pnpm build",
  `node -e "require('fs').rmSync('.turbo/cache', { recursive: true, force: true })"`,
  "pnpm drizzle:push",
  "pnpm dev --filter manage-salon-webpage",
].join(" && ");

export default defineConfig({
  testDir: "./e2e/tests",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  timeout: 60_000,
  reporter: process.env.CI
    ? [htmlReporter, ["github"]]
    : [htmlReporter, ["list"]],
  use: {
    baseURL: e2eEnvironment.manageBaseUrl,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  webServer: [
    {
      command: minioCommand,
      cwd: repositoryRoot,
      port: 9000,
      reuseExistingServer: !process.env.CI,
      stdout: "pipe",
      stderr: "pipe",
      timeout: 90_000,
    },
    {
      command: prepareManageAppCommand,
      cwd: repositoryRoot,
      env: {
        ...process.env,
        DATABASE_URL: e2eEnvironment.databaseUrl,
        JWT_SECRET: e2eEnvironment.jwtSecret,
        PLAYWRIGHT_MANAGEMENT_PASSWORD: e2eEnvironment.managementPassword,
        SALON_URL: e2eEnvironment.salonBaseUrl,
        S3_URL: e2eEnvironment.s3Url,
        S3_SALON_ACCESS_KEY: e2eEnvironment.s3AccessKey,
        S3_SALON_SECRET_KEY: e2eEnvironment.s3SecretKey,
        S3_WEBSITE_BUCKET_NAME: e2eEnvironment.s3BucketName,
        NEXT_TURBOPACK_EXPERIMENTAL_USE_SYSTEM_TLS_CERTS: "1",
        NODE_ENV: e2eEnvironment.nodeEnv,
        PORT: "3000",
      },
      port: 3000,
      reuseExistingServer: !process.env.CI,
      stdout: "pipe",
      stderr: "pipe",
      timeout: 240_000,
    },
    {
      command:
        "corepack pnpm --filter salon-webpage exec next dev --turbopack -p 3001",
      cwd: repositoryRoot,
      env: {
        ...process.env,
        DATABASE_URL: e2eEnvironment.databaseUrl,
        JWT_SECRET: e2eEnvironment.jwtSecret,
        PLAYWRIGHT_MANAGEMENT_PASSWORD: e2eEnvironment.managementPassword,
        SALON_URL: e2eEnvironment.salonBaseUrl,
        S3_URL: e2eEnvironment.s3Url,
        S3_SALON_ACCESS_KEY: e2eEnvironment.s3AccessKey,
        S3_SALON_SECRET_KEY: e2eEnvironment.s3SecretKey,
        S3_WEBSITE_BUCKET_NAME: e2eEnvironment.s3BucketName,
        NEXT_TURBOPACK_EXPERIMENTAL_USE_SYSTEM_TLS_CERTS: "1",
        NODE_ENV: e2eEnvironment.nodeEnv,
      },
      port: 3001,
      reuseExistingServer: !process.env.CI,
      stdout: "pipe",
      stderr: "pipe",
      timeout: 90_000,
    },
  ],
  projects: [
    {
      name: "desktop-chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
    {
      name: "mobile-chromium",
      use: {
        ...devices["Pixel 7"],
      },
    },
  ],
});
