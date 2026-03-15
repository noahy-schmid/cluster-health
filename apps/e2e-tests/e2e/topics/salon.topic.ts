import { expect, type Page, test as base } from "@playwright/test";
import { e2eEnvironment } from "../env";
import type { SalonState } from "../helpers/types";
import type { AuthTopic } from "./auth.topic";

export class SalonTopic {
  private salon: SalonState | undefined;

  constructor(
    private readonly managePage: Page,
    private readonly authTopic: AuthTopic,
    private readonly uniqueSuffix: string,
  ) {}

  async iHaveASalon(): Promise<SalonState> {
    return base.step("I have a salon", async () => {
      if (this.salon) {
        return this.salon;
      }

      await this.authTopic.iHaveAnAccount();

      const name = `Playwright Salon ${this.uniqueSuffix}`;

      await this.managePage.goto(`${e2eEnvironment.manageBaseUrl}/onboarding`);
      await this.managePage
        .getByRole("link", { name: "Salon erstellen" })
        .click();
      await expect(
        this.managePage.getByRole("heading", { name: "Salon anlegen" }),
      ).toBeVisible();

      await this.managePage.getByLabel("Salonname").fill(name);
      await this.managePage
        .getByLabel("Strasse und Hausnummer")
        .fill("Test Street 1");
      await this.managePage.getByLabel("PLZ").fill("80331");
      await this.managePage.getByLabel("Stadt").fill("München");
      await this.managePage.getByLabel("Telefonnummer").fill("+49 89 123456");
      await this.managePage
        .getByRole("button", { name: "Salon erstellen" })
        .click();

      const resourceSetupMatch = new RegExp(
        `${e2eEnvironment.manageBaseUrl}/onboarding/[0-9a-f-]{36}/resources$`,
      );
      await expect(this.managePage).toHaveURL(resourceSetupMatch);

      const match = new URL(this.managePage.url()).pathname.match(
        /^\/onboarding\/([0-9a-f-]{36})\/resources$/,
      );
      const salonId = match?.[1];

      if (!salonId) {
        throw new Error(
          `Could not extract salonId from ${this.managePage.url()}`,
        );
      }

      await expect(
        this.managePage.getByRole("heading", {
          name: "Terminplanung einrichten",
        }),
      ).toBeVisible();

      await this.managePage
        .getByRole("button", { name: "Weiter zum Salon" })
        .click();

      await expect(this.managePage).toHaveURL(
        `${e2eEnvironment.manageBaseUrl}/salon/${salonId}`,
        {
          timeout: 20_000,
        },
      );

      this.salon = { salonId, name };
      return this.salon;
    });
  }
}
