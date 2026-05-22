import { defineConfig } from "eslint/config";
import { nextJsConfig } from "@repo/eslint-config/next-js";

export default defineConfig([
  ...nextJsConfig,
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
]);
