import { defineConfig, devices } from "@playwright/test";
import path from "path";
import { e2eEnvironment } from "./e2e/env";

const repositoryRoot = path.resolve(__dirname, "../..");

export default defineConfig({
  testDir: "./e2e/tests",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  timeout: 60_000,
  reporter: process.env.CI
    ? [["html", { open: "never" }], ["github"]]
    : [["html", { open: "never" }], ["list"]],
  use: {
    baseURL: e2eEnvironment.manageBaseUrl,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  webServer: [
    {
      command:
        "pnpm e2e:prepare && pnpm --filter manage-salon-webpage exec next dev -p 3000",
      cwd: repositoryRoot,
      env: {
        ...process.env,
        DATABASE_URL: e2eEnvironment.databaseUrl,
        JWT_SECRET: e2eEnvironment.jwtSecret,
        PLAYWRIGHT_MANAGEMENT_PASSWORD: e2eEnvironment.managementPassword,
        SALON_URL: e2eEnvironment.salonBaseUrl,
        NODE_ENV: e2eEnvironment.nodeEnv,
      },
      port: 3000,
      reuseExistingServer: !process.env.CI,
      stdout: "pipe",
      stderr: "pipe",
      timeout: 90_000,
    },
    {
      command: "pnpm --filter salon-webpage exec next dev --turbopack -p 3001",
      cwd: repositoryRoot,
      env: {
        ...process.env,
        DATABASE_URL: e2eEnvironment.databaseUrl,
        JWT_SECRET: e2eEnvironment.jwtSecret,
        PLAYWRIGHT_MANAGEMENT_PASSWORD: e2eEnvironment.managementPassword,
        SALON_URL: e2eEnvironment.salonBaseUrl,
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
