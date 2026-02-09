import type { Linter } from "eslint";
import eslintConfigPrettier from "eslint-config-prettier";
import unusedImports from "eslint-plugin-unused-imports";
import turbo from "eslint-plugin-turbo";

/**
 * A shared ESLint configuration for the repository.
 */
export const config: Linter.Config[] = [
  eslintConfigPrettier,
  turbo.configs["flat/recommended"],
  {
    plugins: {
      "unused-imports": unusedImports,
    },
    rules: {
      "unused-imports/no-unused-imports": "error",
    },
  },
  {
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "prefer-const": "error",
    },
  },
  {
    ignores: ["dist/**"],
  },
];
