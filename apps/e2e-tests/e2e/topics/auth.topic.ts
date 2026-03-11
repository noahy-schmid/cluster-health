import { expect, type Page, test as base } from "@playwright/test";
import { e2eEnvironment } from "../env";
import type { ManagementAccount } from "../helpers/types";

export class AuthTopic {
  private managementAccount: ManagementAccount | undefined;

  constructor(
    private readonly managePage: Page,
    private readonly uniqueSuffix: string,
  ) {}

  async iHaveAnAccount(): Promise<ManagementAccount> {
    return base.step("I have an account", async () => {
      if (this.managementAccount) {
        return this.managementAccount;
      }

      const email = `playwright-${this.uniqueSuffix}@example.com`;
      const password = e2eEnvironment.managementPassword;

      await this.managePage.goto(
        `${e2eEnvironment.manageBaseUrl}/auth/register`,
      );
      await this.managePage
        .getByLabel("E-Mail-Adresse", { exact: true })
        .fill(email);
      await this.managePage.getByLabel("E-Mail-Adresse bestätigen").fill(email);
      await this.managePage
        .getByLabel("Passwort", { exact: true })
        .fill(password);
      await this.managePage.getByLabel("Passwort bestätigen").fill(password);
      await this.managePage
        .getByRole("button", { name: "Registrieren" })
        .click();

      await expect(this.managePage).toHaveURL(
        `${e2eEnvironment.manageBaseUrl}/onboarding`,
      );

      this.managementAccount = { email, password };
      return this.managementAccount;
    });
  }
}
