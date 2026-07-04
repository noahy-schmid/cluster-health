import { Data } from "effect";

export class OpeningHoursValidationError extends Data.TaggedError(
  "OpeningHoursValidationError",
)<{
  message: string;
}> {}

export class OpeningHoursNotFoundError extends Data.TaggedError(
  "OpeningHoursNotFoundError",
)<{
  id: string;
}> {}

export class OpeningHoursInternalError extends Data.TaggedError(
  "OpeningHoursInternalError",
)<{
  message: string;
  cause?: unknown;
}> {}
