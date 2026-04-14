import { expect, type Page, test as base } from "@playwright/test";
import { e2eEnvironment } from "../env";
import type { OpeningHoursInput, OpeningHoursState } from "../helpers/types";
import type { SalonTopic } from "./salon.topic";

export class OpeningHoursTopic {
  constructor(
    private readonly managePage: Page,
    private readonly salonTopic: SalonTopic,
  ) {}

  /** Navigate to the opening hours page for the current salon. */
  async iGoToOpeningHours(): Promise<void> {
    return base.step("I go to the opening hours page", async () => {
      const { salonId } = await this.salonTopic.iHaveASalon();
      await this.managePage.goto(
        `${e2eEnvironment.manageBaseUrl}/salon/${salonId}/opening-hours`,
      );
      await expect(
        this.managePage.getByRole("heading", { name: "Öffnungszeiten" }),
      ).toBeVisible();
    });
  }

  /**
   * Sets the opening hours for a specific date and chooses how to apply the
   * change ("just-this-day" or "every-weekday").
   */
  async iSetOpeningHoursForDate(
    input: OpeningHoursInput,
    applyAs: "just-this-day" | "every-weekday",
  ): Promise<OpeningHoursState> {
    return base.step(
      `I set opening hours for ${input.date} (applyAs=${applyAs})`,
      async () => {
        // Click the date row to expand it
        const row = this.managePage.getByTestId(`date-row-${input.date}`);
        await expect(row).toBeVisible({ timeout: 10_000 });
        await row.click();

        // Toggle open/closed
        if (input.isOpen) {
          await this.managePage
            .getByRole("button", { name: "Geöffnet" })
            .first()
            .click();
        } else {
          await this.managePage
            .getByRole("button", { name: "Geschlossen" })
            .first()
            .click();
        }

        // Set times if open
        if (input.isOpen && input.openTime && input.closeTime) {
          await this.managePage.getByLabel("Von").first().fill(input.openTime);
          await this.managePage.getByLabel("Bis").first().fill(input.closeTime);
        }

        // Click "Weiter" to open the apply dialog
        await this.managePage.getByRole("button", { name: "Weiter" }).click();

        // Choose apply scope
        if (applyAs === "just-this-day") {
          await this.managePage
            .getByRole("button", { name: "Nur diesen Tag" })
            .click();
        } else {
          // Click the "Jeden [weekday]" button (starts with "Jeden")
          await this.managePage.getByRole("button", { name: /^Jeden/ }).click();
        }

        // Wait for dialog to close (overlay disappears)
        await expect(
          this.managePage.getByRole("button", { name: "Nur diesen Tag" }),
        ).not.toBeVisible({ timeout: 10_000 });

        return {
          date: input.date,
          isOpen: input.isOpen,
          openTime: input.openTime ?? null,
          closeTime: input.closeTime ?? null,
          appliedAs: applyAs === "just-this-day" ? "exception" : "weekly",
        };
      },
    );
  }

  /**
   * Asserts that a specific date row shows the expected open/closed state.
   */
  async iSeeDateAs(
    date: string,
    expected: { isOpen: boolean; openTime?: string; closeTime?: string },
  ): Promise<void> {
    return base.step(
      `I see date ${date} as ${expected.isOpen ? "open" : "closed"}`,
      async () => {
        const row = this.managePage.getByTestId(`date-row-${date}`);
        await expect(row).toBeVisible({ timeout: 10_000 });

        if (expected.isOpen && expected.openTime && expected.closeTime) {
          await expect(row).toContainText(
            `${expected.openTime} – ${expected.closeTime}`,
          );
        } else if (!expected.isOpen) {
          await expect(row).toContainText("Geschlossen");
        }
      },
    );
  }

  /**
   * Asserts that a date row carries an "Ausnahme" badge (exception indicator).
   */
  async iSeeDateHasExceptionBadge(date: string): Promise<void> {
    return base.step(`I see date ${date} has an exception badge`, async () => {
      const row = this.managePage.getByTestId(`date-row-${date}`);
      await expect(row).toBeVisible({ timeout: 10_000 });
      await expect(row.getByText("Ausnahme")).toBeVisible();
    });
  }
}
