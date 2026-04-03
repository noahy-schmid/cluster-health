import { describe, expect, it } from "vitest";

import {
  derivePreviewDatabaseName,
  derivePreviewDeploymentHash,
  isPreviewDeployment,
} from "./index";

const previewDeployUrl =
  "preview-dein-salon-migration-service-dfpqwi-djtdqw-46-225-12-237.traefik.me";

describe("isPreviewDeployment", () => {
  it("returns true for development context", () => {
    expect(isPreviewDeployment("development")).toBe(true);
  });

  it("returns false for non-preview contexts", () => {
    expect(isPreviewDeployment("production")).toBe(false);
  });
});

describe("derivePreviewDatabaseName", () => {
  it("creates a stable hashed database name from bare host style URL", () => {
    expect(derivePreviewDatabaseName(previewDeployUrl)).toBe(
      "preview_a1406b7d742357c90740",
    );
  });
});

describe("derivePreviewDeploymentHash", () => {
  it("creates a stable hash suffix from bare host style URL", () => {
    expect(derivePreviewDeploymentHash(previewDeployUrl)).toBe(
      "a1406b7d742357c90740",
    );
  });
});
