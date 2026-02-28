import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Effect, Either, Layer, Option } from "effect";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  getOrCreatePostgreSQLContainer,
  getOrCreateMinioContainer,
} from "@repo/test-fixtures";
import {
  MediaService,
  type PrepareUploadInput,
} from "./services/media/media.interface";
import { WebsiteService } from "./services/website/website.interface";
import { PostgresWebsiteAdapter } from "./adapters/postgres-website.adapter";
import { WebsiteServiceLive } from "./services/website/website.service";
import { SalonPort } from "./ports/salon.port";
import { Configuration } from "./infrastructure/config.interface";
import { Database } from "./infrastructure/database.interface";
import { DatabaseLayer } from "./infrastructure/database.service";
import { WebsitePort } from "./ports/website.port";
import { FileStoragePort } from "./ports/file-storage.port";
import { MediaPort } from "./ports/media.port";
import { S3FileStorageAdapter } from "./adapters/s3-file-storage.adapter";
import { MediaServiceLive } from "./services/media/media.service";
import { PostgresMediaAdapter } from "./adapters/postgres-media.adapter";
import axios from "axios";
import FormData from "form-data";

const TEST_IMAGE_PATH = join(__dirname, "../test/fixtures/test-image.png");
const TEST_IMAGE = readFileSync(TEST_IMAGE_PATH);
const LARGE_TEST_IMAGE = Buffer.alloc(5 * 1024 * 1024, "a");

const uploadFileToPresignedUrlEffect = (
  uploadUrl: string,
  uploadFields: Record<string, string>,
  fileContent: Uint8Array,
) =>
  Effect.tryPromise({
    try: async () => {
      const formData = new FormData();
      for (const [key, value] of Object.entries(uploadFields)) {
        formData.append(key, value);
      }
      formData.append("file", Buffer.from(fileContent));

      const response = await axios.post(uploadUrl, formData);
      return response.status >= 200 && response.status < 300;
    },
    catch: () => false,
  }).pipe(Effect.catchAll(() => Effect.succeed(false)));

describe("MediaService Integration Tests", () => {
  let pgContainer: Awaited<ReturnType<typeof getOrCreatePostgreSQLContainer>>;
  let minioContainer: Awaited<ReturnType<typeof getOrCreateMinioContainer>>;
  let websiteId: string;
  let theSalonId: string;
  let portLayer: Layer.Layer<
    | Database
    | Configuration
    | SalonPort
    | WebsitePort
    | FileStoragePort
    | MediaPort,
    never,
    never
  >;

  const prepareUploadEffect = (input: PrepareUploadInput) =>
    Effect.gen(function* () {
      const service = yield* MediaService;
      const result = yield* service.prepareUpload(input);
      expect(result).toBeDefined();
      expect(result.mediaId).toBeDefined();
      expect(typeof result.mediaId).toBe("string");
      expect(result.uploadUrl).toBeDefined();
      expect(typeof result.uploadUrl).toBe("string");
      expect(result.uploadUrl).toContain(
        `http://${minioContainer.host}:${minioContainer.port}`,
      );
      expect(result.uploadFields).toBeDefined();
      expect(typeof result.uploadFields).toBe("object");
      expect(Object.keys(result.uploadFields).length).toBeGreaterThan(0);
      return result;
    });

  const confirmUploadEffect = (mediaId: string) =>
    Effect.gen(function* () {
      const service = yield* MediaService;
      yield* service.confirmUpload(mediaId);
    });

  const getMediaByIdEffect = (mediaId: string) =>
    Effect.gen(function* () {
      const service = yield* MediaService;
      const mediaFile = yield* service.getMediaById(mediaId);
      return mediaFile;
    });

  const listMediaEffect = (websiteId: string) =>
    Effect.gen(function* () {
      const service = yield* MediaService;
      const media = yield* service.listMedia(websiteId);
      return media;
    });

  beforeAll(async () => {
    pgContainer = await getOrCreatePostgreSQLContainer();
    minioContainer = await getOrCreateMinioContainer();

    theSalonId = crypto.randomUUID();

    const testConfigurationLayer = Layer.effect(
      Configuration,
      Effect.succeed({
        databaseUrl: pgContainer.databaseUrl,
        s3Url: `http://${minioContainer.host}:${minioContainer.port}`,
        s3Region: "us-east-1",
        s3AccessKey: minioContainer.accessKey,
        s3SecretKey: minioContainer.secretKey,
        s3BucketName: "test-bucket",
      }),
    );

    const mockSalonPortLayer = Layer.succeed(SalonPort, {
      salonExists: (salonId) => Effect.succeed(salonId === theSalonId),
    });

    portLayer = Layer.mergeAll(
      PostgresWebsiteAdapter,
      S3FileStorageAdapter,
      PostgresMediaAdapter,
      mockSalonPortLayer,
    ).pipe(
      Layer.provideMerge(DatabaseLayer),
      Layer.provideMerge(testConfigurationLayer),
    );

    await Effect.runPromise(
      Effect.gen(function* () {
        const { db } = yield* Database;
        yield* Effect.tryPromise(() =>
          migrate(db, { migrationsFolder: "drizzle" }),
        );

        const websiteService = yield* WebsiteService;
        const resultingId = yield* websiteService.createWebsite({
          salonId: theSalonId,
          slug: "test-website",
          title: "Test Website",
          favicon: Option.none(),
        });
        websiteId = resultingId;
      }).pipe(
        Effect.provide(WebsiteServiceLive.pipe(Layer.provideMerge(portLayer))),
      ),
    );
  }, 60_000);

  afterAll(async () => {
    if (pgContainer) {
      await pgContainer.stop();
    }
    if (minioContainer) {
      await minioContainer.stop();
    }
  });

  it("should prepare an upload with valid data and return proper output", async () => {
    const testInput: PrepareUploadInput = {
      websiteId: websiteId,
      fileName: "test-image.png",
      mimeType: "image/png",
      fileSize: TEST_IMAGE.length,
    };

    const program = Effect.gen(function* () {
      const prepareResult = yield* prepareUploadEffect(testInput);

      const uploadSuccessful = yield* uploadFileToPresignedUrlEffect(
        prepareResult.uploadUrl,
        prepareResult.uploadFields,
        TEST_IMAGE,
      );
      if (!uploadSuccessful) {
        yield* Effect.fail(new Error("File upload to presigned URL failed"));
      }

      yield* confirmUploadEffect(prepareResult.mediaId);

      const mediaFile = yield* getMediaByIdEffect(prepareResult.mediaId);
      expect(mediaFile.uploadConfirmed).toBe(true);
      expect(mediaFile.fileName).toBe(testInput.fileName);
      expect(mediaFile.mimeType).toBe(testInput.mimeType);
      expect(mediaFile.fileSize).toBe(testInput.fileSize);
      expect(mediaFile.websiteId).toBe(testInput.websiteId);

      const media = yield* listMediaEffect(testInput.websiteId);
      expect(media.length).toBe(1);
      expect(media[0].id).toBe(prepareResult.mediaId);
    });

    await Effect.runPromise(
      program.pipe(
        Effect.provide(MediaServiceLive.pipe(Layer.provide(portLayer))),
      ),
    );
  });

  it("should return an error when file size exceeds limit", async () => {
    const testInput: PrepareUploadInput = {
      websiteId: websiteId,
      fileName: "too-large-image.jpg",
      mimeType: "image/jpeg",
      fileSize: 15 * 1024 * 1024,
    };

    const program = Effect.gen(function* () {
      const service = yield* MediaService;
      const prepareResult = yield* service
        .prepareUpload(testInput)
        .pipe(Effect.either);
      expect(Either.isLeft(prepareResult)).toBe(true);
      if (Either.isLeft(prepareResult)) {
        expect(prepareResult.left._tag).toBe("MediaValidationError");
        expect(prepareResult.left.message).toContain("exceeds limit");
      }
    });

    await Effect.runPromise(
      program.pipe(
        Effect.provide(MediaServiceLive.pipe(Layer.provide(portLayer))),
      ),
    );
  });

  it("should reject upload when actual file size exceeds declared size", async () => {
    const testInput: PrepareUploadInput = {
      websiteId: websiteId,
      fileName: "image.png",
      mimeType: "image/png",
      fileSize: TEST_IMAGE.length,
    };

    const program = Effect.gen(function* () {
      const prepareResult = yield* prepareUploadEffect(testInput);

      const uploadSuccessful = yield* uploadFileToPresignedUrlEffect(
        prepareResult.uploadUrl,
        prepareResult.uploadFields,
        LARGE_TEST_IMAGE,
      );
      expect(uploadSuccessful).toBe(false);
    });

    await Effect.runPromise(
      program.pipe(
        Effect.provide(MediaServiceLive.pipe(Layer.provide(portLayer))),
      ),
    );
  });

  it("should return an error when confirming upload without actual file in S3", async () => {
    const testInput: PrepareUploadInput = {
      websiteId: websiteId,
      fileName: "never-uploaded.png",
      mimeType: "image/png",
      fileSize: TEST_IMAGE.length,
    };

    const program = Effect.gen(function* () {
      const prepareResult = yield* prepareUploadEffect(testInput);

      const confirmResult = yield* confirmUploadEffect(
        prepareResult.mediaId,
      ).pipe(Effect.either);

      expect(Either.isLeft(confirmResult)).toBe(true);
      if (Either.isLeft(confirmResult)) {
        expect(confirmResult.left._tag).toBe("MediaError");
      }
    });

    await Effect.runPromise(
      program.pipe(
        Effect.provide(MediaServiceLive.pipe(Layer.provide(portLayer))),
      ),
    );
  });
});
