import type { Linter } from "eslint";
import eslintConfigPrettier from "eslint-config-prettier";
import unusedImports from "eslint-plugin-unused-imports";
import turbo from "eslint-plugin-turbo";
import tseslint from "typescript-eslint";

/**
 * A shared ESLint configuration for the repository.
 */
export const config: Linter.Config[] = [
  eslintConfigPrettier,
  // @ts-ignore
  tseslint.configs.strict,
  // @ts-ignore
  tseslint.configs.stylistic,
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
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/consistent-type-definitions": "off",
      "prefer-const": "error",
    },
  },
  {
    ignores: ["dist/**"],
  },
];
