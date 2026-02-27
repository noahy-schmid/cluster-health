import "server-only";

import { Effect, Option } from "effect";
import { WebsiteService, WebsiteLayer } from "@repo/website-database";
import { AuthGuard } from "./auth.guard";

export const WebsiteAccessGuard = {
  async canEditWebsite(
    websiteId: string,
  ): Promise<{ success: true } | { success: false; error: string }> {
    const session = await AuthGuard.getAuthToken();

    if (!session) {
      return { success: false, error: "Ungültige Sitzung" };
    }

    if (!session.salonId) {
      return { success: false, error: "Kein Salon zugeordnet" };
    }

    const effect = Effect.gen(function* () {
      const websiteService = yield* WebsiteService;
      return yield* websiteService.websiteExistsForSalon(session.salonId!).pipe(
        Effect.map((websiteIdOption) => {
          if (Option.isNone(websiteIdOption)) {
            return {
              success: false as const,
              error: "Keine Website für diesen Salon gefunden",
            };
          }
          if (websiteIdOption.value !== websiteId) {
            return {
              success: false as const,
              error: "Nicht autorisiert",
            };
          }
          return { success: true as const };
        }),
        Effect.catchTag("WebsiteDatabaseError", (error) =>
          Effect.succeed({
            success: false as const,
            error: `Datenbankfehler: ${error.message}`,
          }),
        ),
      );
    }).pipe(Effect.provide(WebsiteLayer));

    return await Effect.runPromise(effect);
  },
};
