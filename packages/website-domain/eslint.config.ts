import { config } from "@repo/eslint-config/base";

import { defineConfig } from "eslint/config";

export default defineConfig([
  ...config,
  {
    files: ["**/*.ts"],
    ignores: ["dist/**"],
  },
]);
