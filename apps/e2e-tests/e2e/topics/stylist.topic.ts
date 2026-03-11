import { expect, type Page, test as base } from "@playwright/test";
import { e2eEnvironment } from "../env";
import type { StylistInput, StylistState } from "../helpers/types";
import type { SalonTopic } from "./salon.topic";

export class StylistTopic {
  private readonly stylists: StylistState[] = [];

  constructor(
    private readonly managePage: Page,
    private readonly salonTopic: SalonTopic,
    private readonly uniqueSuffix: string,
  ) {}

  async iCreateAStylist(input: StylistInput = {}): Promise<StylistState> {
    return base.step("I create a stylist", async () => {
      const { salonId } = await this.salonTopic.iHaveASalon();
      const stylistNumber = this.stylists.length + 1;
      const stylist: StylistState = {
        name:
          input.name ??
          `Playwright Stylist ${stylistNumber} ${this.uniqueSuffix}`,
        subtitle: input.subtitle ?? `Senior Stylist ${stylistNumber}`,
        description:
          input.description ??
          `Playwright Beschreibung für Stylist ${stylistNumber}.`,
        profileImagePath: input.profileImagePath,
      };

      await this.managePage.goto(
        `${e2eEnvironment.manageBaseUrl}/salon/${salonId}/stylists/create`,
      );
      await expect(
        this.managePage.getByRole("heading", { name: "Neuer Stylist" }),
      ).toBeVisible();

      await this.managePage
        .getByPlaceholder("z.B. Max Mustermann")
        .fill(stylist.name);
      await this.managePage
        .getByPlaceholder("z.B. Salon Master, Stylist, Friseur")
        .fill(stylist.subtitle);
      await this.managePage
        .getByPlaceholder("Erzähle etwas über den Stylisten...")
        .fill(stylist.description);

      if (stylist.profileImagePath) {
        await this.managePage.getByText("Kein Bild ausgewählt").click();
        await expect(
          this.managePage.getByRole("heading", { name: "Medien auswählen" }),
        ).toBeVisible();
        await this.managePage
          .locator('input[type="file"]')
          .setInputFiles(stylist.profileImagePath);
        await expect(
          this.managePage.getByRole("heading", { name: "Medien auswählen" }),
        ).toBeHidden({ timeout: 20_000 });
        await expect(
          this.managePage.getByAltText("Selected media"),
        ).toBeVisible();
      }

      await this.managePage
        .getByRole("button", { name: "Stylist erstellen" })
        .click();

      await expect(this.managePage).toHaveURL(
        `${e2eEnvironment.manageBaseUrl}/salon/${salonId}/stylists`,
        {
          timeout: 20_000,
        },
      );
      await expect(
        this.managePage.getByRole("heading", { name: "Stylisten" }),
      ).toBeVisible();
      await expect(
        this.managePage.getByRole("heading", { name: stylist.name }),
      ).toBeVisible();

      if (stylist.profileImagePath) {
        await expect(this.managePage.getByAltText(stylist.name)).toBeVisible();
      }

      this.stylists.push(stylist);
      return stylist;
    });
  }
}
