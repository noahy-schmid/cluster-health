import { GenericContainer, Wait, StartedTestContainer } from "testcontainers";

export interface MinioTestContainer {
  container: StartedTestContainer;
  host: string;
  port: number;
  accessKey: string;
  secretKey: string;
  bucket: string;
  stop: () => Promise<void>;
}

let cachedContainer: MinioTestContainer | null = null;

const DEFAULT_ACCESS_KEY = "minioadmin";
const DEFAULT_SECRET_KEY = "minioadmin";
const DEFAULT_BUCKET = "test-bucket";

export async function getOrCreateMinioContainer(): Promise<MinioTestContainer> {
  if (cachedContainer) {
    return cachedContainer;
  }

  const container = await new GenericContainer("minio/minio:latest")
    .withExposedPorts(9000, 9001)
    .withEnvironment({
      MINIO_ROOT_USER: DEFAULT_ACCESS_KEY,
      MINIO_ROOT_PASSWORD: DEFAULT_SECRET_KEY,
    })
    .withCommand(["server", "/data", "--console-address", ":9001"])
    .withWaitStrategy(Wait.forLogMessage(/MinIO Object Storage Server/, 1))
    .start();

  const host = container.getHost();
  const port = container.getMappedPort(9000);

  console.log(`Started Minio container at ${host}:${port}`);

  cachedContainer = {
    container,
    host,
    port,
    accessKey: DEFAULT_ACCESS_KEY,
    secretKey: DEFAULT_SECRET_KEY,
    bucket: DEFAULT_BUCKET,
    stop: async () => {
      await container.stop();
      cachedContainer = null;
    },
  };

  return cachedContainer;
}

export async function createMinioContainer(
  accessKey: string = DEFAULT_ACCESS_KEY,
  secretKey: string = DEFAULT_SECRET_KEY,
  bucket: string = DEFAULT_BUCKET,
): Promise<MinioTestContainer> {
  const container = await new GenericContainer("minio/minio:latest")
    .withExposedPorts(9000, 9001)
    .withEnvironment({
      MINIO_ROOT_USER: accessKey,
      MINIO_ROOT_PASSWORD: secretKey,
    })
    .withCommand(["server", "/data", "--console-address", ":9001"])
    .withWaitStrategy(Wait.forLogMessage(/MinIO Object Storage Server/, 1))
    .start();

  const host = container.getHost();
  const port = container.getMappedPort(9000);

  return {
    container,
    host,
    port,
    accessKey,
    secretKey,
    bucket,
    stop: async () => {
      await container.stop();
    },
  };
}

export function getMinioConnectionString(
  container: MinioTestContainer,
): string {
  return `http://${container.accessKey}:${container.secretKey}@${container.host}:${container.port}`;
}
