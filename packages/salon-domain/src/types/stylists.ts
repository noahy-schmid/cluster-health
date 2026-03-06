import { Schema } from "effect";

export const StylistSchema = Schema.Struct({
  id: Schema.String,
  createdAt: Schema.Date,
  updatedAt: Schema.Date,
  salonId: Schema.String.pipe(
    Schema.nonEmptyString({ message: () => "Salon ID cannot be empty" }),
  ),
  name: Schema.String.pipe(
    Schema.compose(Schema.Trim),
    Schema.nonEmptyString({ message: () => "Stylist name cannot be empty" }),
  ),
  subtitle: Schema.String.pipe(
    Schema.compose(Schema.Trim),
    Schema.nonEmptyString({
      message: () => "Stylist subtitle cannot be empty",
    }),
  ),
  description: Schema.String.pipe(
    Schema.compose(Schema.Trim),
    Schema.nonEmptyString({
      message: () => "Stylist description cannot be empty",
    }),
  ),
  profileImageMediaId: Schema.OptionFromSelf(
    Schema.String.pipe(Schema.compose(Schema.Trim)),
  ),
});

/**
 * Schema for creating a new stylist.
 * Validates all required fields with proper constraints.
 */
export const CreateStylistInputSchema = StylistSchema.pipe(
  Schema.omit("id", "createdAt", "updatedAt"),
);

/**
 * Schema for updating an existing stylist.
 * The salonId cannot be updated, and createdAt/updatedAt are managed by the system, so they are omitted from the input.
 */
export const UpdateStylistInputSchema = StylistSchema.pipe(
  Schema.omit("salonId", "createdAt", "updatedAt", "id"),
);

export type Stylist = Schema.Schema.Type<typeof StylistSchema>;

export type CreateStylistInput = Schema.Schema.Type<
  typeof CreateStylistInputSchema
>;

export type UpdateStylistInput = Schema.Schema.Type<
  typeof UpdateStylistInputSchema
>;
