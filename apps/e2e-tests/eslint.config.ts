import { config } from "@repo/eslint-config/base";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    ignores: [".turbo/**", "playwright-report/**", "test-results/**"],
  },
  ...config,
  {
    files: ["**/*.ts"],
  },
]);
