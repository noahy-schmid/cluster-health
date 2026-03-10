import { Effect, Option, Schema } from "effect";
import { describe, expect, it } from "vitest";
import {
  CreateWebsiteInputSchema,
  UpdateWebsiteSettingsInputSchema,
} from "./website";

describe("website settings schema", () => {
  it("accepts an optional sticky menu title", async () => {
    const result = await Effect.runPromise(
      Schema.decode(CreateWebsiteInputSchema)({
        salonId: "salon-1",
        slug: "mein-salon",
        title: "Mein Salon",
        favicon: Option.none(),
        menuBarTitle: Option.some("Salon am Platz"),
        menuLogoPosition: "left",
      }),
    );

    expect(result.menuLogoPosition).toBe("left");
    expect(Option.getOrNull(result.menuBarTitle)).toBe("Salon am Platz");
  });

  it("allows centered sticky logos without a menu title", async () => {
    const result = await Effect.runPromise(
      Schema.decode(UpdateWebsiteSettingsInputSchema)({
        menuBarTitle: Option.none(),
        menuLogoPosition: "center",
      }),
    );

    expect(result.menuLogoPosition).toBe("center");
    expect(Option.isNone(result.menuBarTitle!)).toBe(true);
  });
});
