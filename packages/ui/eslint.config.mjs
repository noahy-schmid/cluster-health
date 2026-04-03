import { config } from "@repo/eslint-config/react-internal";

import { defineConfig } from "eslint/config";

export default defineConfig([
  ...config,
  {
    files: ["**/*.ts", "**/*.tsx"],
    ignores: ["dist/**"],
  },
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: new URL(".", import.meta.url).pathname.slice(0, -1),
      },
    },
  },
]);
