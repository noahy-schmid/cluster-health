import { randomUUID } from "crypto";

export function createUniqueSuffix(): string {
  return randomUUID();
}
