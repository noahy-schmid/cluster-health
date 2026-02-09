import type { Linter } from "eslint";
import { config as baseConfig } from "./base.js";
import { globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

/**
 * A custom ESLint configuration for libraries that use Next.js.
 */
export const nextJsConfig: Linter.Config[] = [
  ...baseConfig,
  ...nextVitals,
  ...nextTypescript,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
];
