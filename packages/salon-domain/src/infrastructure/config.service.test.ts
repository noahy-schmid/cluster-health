import { describe, expect, it } from "vitest";
import { derivePreviewBucketSuffix } from "./config.service";

describe("derivePreviewBucketSuffix", () => {
  it("sanitizes a deployment hostname into a bucket-safe suffix", () => {
    const suffix = derivePreviewBucketSuffix(
      "https://Preview-App_01.dev.example.com/some/path",
    );

    expect(suffix).toBe("preview-app-01-dev-example-com");
  });

  it("collapses repeated hyphens in hostname", () => {
    const suffix = derivePreviewBucketSuffix(
      "https://my---preview.example.com",
    );

    expect(suffix).toBe("my-preview-example-com");
  });
});
