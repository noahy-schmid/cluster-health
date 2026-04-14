import { defineConfig, devices } from "@playwright/test";
import path from "path";
import { e2eEnvironment } from "./e2e/env.js";

const repositoryRoot = path.resolve(import.meta.dirname, "../..");
const appServerStartupTimeout = 240_000;
const salonWebpageBuildIdPath = "apps/salon-webpage/.next/BUILD_ID";
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
  "pnpm db:reset",
  "pnpm --filter manage-salon-webpage start",
].join(" && ");
const waitForSalonBuildCommand = [
  "corepack enable",
  `node -e "const fs=require('fs'); const path='${salonWebpageBuildIdPath}'; const startedAt=Date.now(); const timeoutMs=${appServerStartupTimeout}; const wait=()=>{ if (fs.existsSync(path)) process.exit(0); if (Date.now() - startedAt > timeoutMs) { console.error('Timed out waiting for salon-webpage build output at ' + path); process.exit(1); } setTimeout(wait, 1000); }; wait()"`,
  "pnpm --filter salon-webpage start",
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
        DATABASE_USER: e2eEnvironment.databaseUser,
        DATABASE_PASSWORD: e2eEnvironment.databasePassword,
        DATABASE_NAME: e2eEnvironment.databaseName,
        JWT_SECRET: e2eEnvironment.jwtSecret,
        PLAYWRIGHT_MANAGEMENT_PASSWORD: e2eEnvironment.managementPassword,
        SALON_URL: e2eEnvironment.salonBaseUrl,
        S3_URL: e2eEnvironment.s3Url,
        S3_REGION: e2eEnvironment.s3Region,
        S3_SALON_ACCESS_KEY: e2eEnvironment.s3AccessKey,
        S3_SALON_SECRET_KEY: e2eEnvironment.s3SecretKey,
        S3_SALON_BUCKET: e2eEnvironment.s3BucketName,
        S3_SALON_PRINCIPAL: e2eEnvironment.s3Principal,
        S3_BUCKET_POLICY_TEMPLATE: e2eEnvironment.s3BucketPolicyTemplate,
        S3_ALLOW_DOMAINS: e2eEnvironment.s3AllowDomains,
        NEXT_TURBOPACK_EXPERIMENTAL_USE_SYSTEM_TLS_CERTS: "1",
        NODE_ENV: e2eEnvironment.nodeEnv,
        PORT: "3000",
      },
      port: 3000,
      reuseExistingServer: !process.env.CI,
      stdout: "pipe",
      stderr: "pipe",
      timeout: appServerStartupTimeout,
    },
    {
      command: waitForSalonBuildCommand,
      cwd: repositoryRoot,
      env: {
        ...process.env,
        DATABASE_URL: e2eEnvironment.databaseUrl,
        DATABASE_USER: e2eEnvironment.databaseUser,
        DATABASE_PASSWORD: e2eEnvironment.databasePassword,
        DATABASE_NAME: e2eEnvironment.databaseName,
        JWT_SECRET: e2eEnvironment.jwtSecret,
        PLAYWRIGHT_MANAGEMENT_PASSWORD: e2eEnvironment.managementPassword,
        SALON_URL: e2eEnvironment.salonBaseUrl,
        S3_URL: e2eEnvironment.s3Url,
        S3_REGION: e2eEnvironment.s3Region,
        S3_SALON_ACCESS_KEY: e2eEnvironment.s3AccessKey,
        S3_SALON_SECRET_KEY: e2eEnvironment.s3SecretKey,
        S3_SALON_BUCKET: e2eEnvironment.s3BucketName,
        S3_SALON_PRINCIPAL: e2eEnvironment.s3Principal,
        S3_BUCKET_POLICY_TEMPLATE: e2eEnvironment.s3BucketPolicyTemplate,
        S3_ALLOW_DOMAINS: e2eEnvironment.s3AllowDomains,
        NEXT_TURBOPACK_EXPERIMENTAL_USE_SYSTEM_TLS_CERTS: "1",
        NODE_ENV: e2eEnvironment.nodeEnv,
        PORT: "3001",
      },
      port: 3001,
      reuseExistingServer: !process.env.CI,
      stdout: "pipe",
      stderr: "pipe",
      timeout: appServerStartupTimeout,
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
