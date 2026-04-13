import { Data } from "effect";

export class StylistAvailabilityValidationError extends Data.TaggedError(
  "StylistAvailabilityValidationError",
)<{
  message: string;
}> {}

export class StylistAvailabilityNotFoundError extends Data.TaggedError(
  "StylistAvailabilityNotFoundError",
)<{
  id: string;
}> {}

export class StylistAvailabilityInternalError extends Data.TaggedError(
  "StylistAvailabilityInternalError",
)<{
  message: string;
  cause?: unknown;
}> {}
