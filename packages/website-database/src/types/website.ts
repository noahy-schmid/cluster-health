import { Schema } from "effect";

/**
 * Full website schema with all fields and validation.
 */
const WebsiteSchema = Schema.Struct({
  id: Schema.String.pipe(Schema.brand("WebsiteId")),
  salonId: Schema.String.pipe(
    Schema.nonEmptyString({ message: () => "Salon ID cannot be empty" }),
  ),
  slug: Schema.String.pipe(
    Schema.compose(Schema.Trim),
    Schema.nonEmptyString({ message: () => "Slug cannot be empty" }),
  ),
  title: Schema.String.pipe(
    Schema.compose(Schema.Trim),
    Schema.nonEmptyString({ message: () => "Title cannot be empty" }),
  ),
  favicon: Schema.OptionFromSelf(
    Schema.String.pipe(Schema.compose(Schema.Trim)),
  ),
  subtitle: Schema.String.pipe(Schema.compose(Schema.Trim)),
  heroImage: Schema.String.pipe(Schema.compose(Schema.Trim)),
  heroTitle: Schema.String.pipe(Schema.compose(Schema.Trim)),
  logo: Schema.String.pipe(Schema.compose(Schema.Trim)),
  textColor: Schema.String,
  colorBackgroundBase: Schema.String.pipe(Schema.compose(Schema.Trim)),
  colorBackgroundElevation1: Schema.String.pipe(Schema.compose(Schema.Trim)),
  colorBackgroundElevation2: Schema.String.pipe(Schema.compose(Schema.Trim)),
  colorForegroundBase: Schema.String.pipe(Schema.compose(Schema.Trim)),
  colorForegroundMuted: Schema.String.pipe(Schema.compose(Schema.Trim)),
  colorForegroundStrong: Schema.String.pipe(Schema.compose(Schema.Trim)),
  colorAccent: Schema.String.pipe(Schema.compose(Schema.Trim)),
  colorOnAccent: Schema.String.pipe(Schema.compose(Schema.Trim)),
});

export const WebsiteSettingsSchema = WebsiteSchema.pipe(
  Schema.pick("title", "slug", "favicon"),
);

export type WebsiteSettings = typeof WebsiteSettingsSchema.Type;

export const CreateWebsiteInputSchema = WebsiteSettingsSchema.pipe(
  Schema.extend(WebsiteSchema.pipe(Schema.pick("salonId"))),
);

export type CreateWebsiteInput = typeof CreateWebsiteInputSchema.Type;

export const UpdateWebsiteSettingsInputSchema = WebsiteSettingsSchema.pipe(
  Schema.partial,
);

export type UpdateWebsiteSettingsInput =
  typeof UpdateWebsiteSettingsInputSchema.Type;

export type WebsiteId = typeof WebsiteSchema.fields.id.Type;
