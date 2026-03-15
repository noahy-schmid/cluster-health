import { expect, type Page, test as base } from "@playwright/test";
import { e2eEnvironment } from "../env";
import { ScreenshotHelper } from "../helpers/screenshot-helper";
import type {
  CenterTextInput,
  CenterTextSectionState,
  StylistsSectionInput,
  StylistsSectionState,
  WebsiteInput,
  WebsiteState,
} from "../helpers/types";
import type { SalonTopic } from "./salon.topic";

export class WebsiteTopic {
  private website: WebsiteState | undefined;
  private centerTextSection: CenterTextSectionState | undefined;
  private stylistsSection: StylistsSectionState | undefined;

  constructor(
    private readonly managePage: Page,
    private readonly salonTopic: SalonTopic,
    private readonly screenshotHelper: ScreenshotHelper,
    private readonly uniqueSuffix: string,
  ) {}

  async iHaveAWebsite(input: WebsiteInput = {}): Promise<WebsiteState> {
    return base.step("I have a website", async () => {
      if (this.website) {
        return this.website;
      }

      const { salonId } = await this.salonTopic.iHaveASalon();
      const slug = input.slug ?? `playwright-${this.uniqueSuffix}`;
      const title = input.title ?? `Playwright Website ${this.uniqueSuffix}`;

      await this.managePage.goto(
        `${e2eEnvironment.manageBaseUrl}/salon/${salonId}/website/create`,
      );
      await expect(
        this.managePage.getByRole("heading", { name: "Webseite erstellen" }),
      ).toBeVisible();

      await this.managePage.getByTestId("website-slug-input").fill(slug);
      await this.managePage.getByTestId("website-title-input").fill(title);
      await this.managePage.getByTestId("website-save-button").click();

      await expect(this.managePage).toHaveURL(
        new RegExp(
          `${e2eEnvironment.manageBaseUrl}/salon/${salonId}/website/[0-9a-f-]{36}$`,
        ),
        {
          timeout: 20_000,
        },
      );

      const match = new URL(this.managePage.url()).pathname.match(
        /^\/salon\/[^/]+\/website\/([0-9a-f-]{36})$/,
      );
      const websiteId = match?.[1];

      if (!websiteId) {
        throw new Error(
          `Could not extract websiteId from ${this.managePage.url()}`,
        );
      }

      this.website = {
        websiteId,
        slug,
        title,
        publicUrl: `${e2eEnvironment.salonBaseUrl}/salon/${slug}`,
      };

      await this.screenshotHelper.capture(
        this.managePage,
        "manage-website-editor-after-create",
      );

      return this.website;
    });
  }

  async iAddACenterTextSection(
    input: CenterTextInput = {},
  ): Promise<CenterTextSectionState> {
    return base.step("I add a center text section", async () => {
      if (this.centerTextSection) {
        return this.centerTextSection;
      }

      const { salonId } = await this.salonTopic.iHaveASalon();
      const website = await this.iHaveAWebsite();
      const menuTitle = input.menuTitle ?? "Über uns";
      const title = input.title ?? `Willkommen ${this.uniqueSuffix}`;
      const content =
        input.content ??
        "Dieser Abschnitt verbindet die Manage- und Salon-Webseiten im End-to-End-Test.";

      await this.managePage.goto(
        `${e2eEnvironment.manageBaseUrl}/salon/${salonId}/website/${website.websiteId}`,
      );
      await this.managePage.getByTestId("add-section-button").first().click();

      await expect(this.managePage).toHaveURL(
        new RegExp(`/website/${website.websiteId}/select-section`),
        {
          timeout: 20_000,
        },
      );

      await this.managePage.getByTestId("section-type-center-text").click();

      await expect(this.managePage).toHaveURL(
        new RegExp(`/website/${website.websiteId}/[0-9a-f-]{36}/center-text$`),
        {
          timeout: 20_000,
        },
      );

      const match = new URL(this.managePage.url()).pathname.match(
        /^\/salon\/[^/]+\/website\/[0-9a-f-]{36}\/([0-9a-f-]{36})\/center-text$/,
      );
      const sectionId = match?.[1];

      if (!sectionId) {
        throw new Error(
          `Could not extract sectionId from ${this.managePage.url()}`,
        );
      }

      await this.managePage
        .getByTestId("center-text-menu-title-input")
        .fill(menuTitle);
      await this.managePage.getByTestId("center-text-title-input").fill(title);
      await this.managePage
        .getByTestId("center-text-content-input")
        .fill(content);
      await this.managePage.getByTestId("center-text-save-button").click();

      await expect(this.managePage).toHaveURL(
        new RegExp(`/website/${website.websiteId}$`),
        {
          timeout: 20_000,
        },
      );
      await expect(
        this.managePage.getByText(title, { exact: true }),
      ).toBeVisible();

      this.centerTextSection = {
        sectionId,
        menuTitle,
        title,
        content,
      };

      await this.screenshotHelper.capture(
        this.managePage,
        "manage-website-editor-after-section-save",
      );

      return this.centerTextSection;
    });
  }

  async iAddAStylistsSection(
    input: StylistsSectionInput = {},
  ): Promise<StylistsSectionState> {
    return base.step("I add a stylists section", async () => {
      if (this.stylistsSection) {
        return this.stylistsSection;
      }

      const { salonId } = await this.salonTopic.iHaveASalon();
      const website = await this.iHaveAWebsite();
      const menuTitle = input.menuTitle ?? "Team";
      const title = input.title ?? "Unser Team";
      const subtitle =
        input.subtitle ??
        "Lernen Sie die Stylisten kennen, die Ihren Look gestalten.";

      await this.managePage.goto(
        `${e2eEnvironment.manageBaseUrl}/salon/${salonId}/website/${website.websiteId}`,
      );
      await this.managePage.getByTestId("add-section-button").first().click();

      await expect(this.managePage).toHaveURL(
        new RegExp(`/website/${website.websiteId}/select-section`),
        {
          timeout: 20_000,
        },
      );

      await this.managePage
        .getByTestId("section-type-stylists-section")
        .click();

      await expect(this.managePage).toHaveURL(
        new RegExp(
          `/website/${website.websiteId}/[0-9a-f-]{36}/stylists-section$`,
        ),
        {
          timeout: 20_000,
        },
      );

      const match = new URL(this.managePage.url()).pathname.match(
        /^\/salon\/[^/]+\/website\/[0-9a-f-]{36}\/([0-9a-f-]{36})\/stylists-section$/,
      );
      const sectionId = match?.[1];

      if (!sectionId) {
        throw new Error(
          `Could not extract sectionId from ${this.managePage.url()}`,
        );
      }

      await this.managePage
        .getByPlaceholder("Abschnitt im Menu anzeigen")
        .fill(menuTitle);
      await this.managePage.getByPlaceholder("z.B. Unser Team").fill(title);
      await this.managePage
        .getByPlaceholder(
          "z.B. Lernen Sie unsere professionellen Stylisten kennen",
        )
        .fill(subtitle);
      await this.managePage
        .getByRole("button", { name: "Änderungen speichern" })
        .click();

      await expect(this.managePage).toHaveURL(
        new RegExp(`/website/${website.websiteId}$`),
        {
          timeout: 20_000,
        },
      );
      await expect(
        this.managePage.getByText(title, { exact: true }),
      ).toBeVisible();
      await expect(
        this.managePage.getByText(menuTitle, { exact: true }),
      ).toBeVisible();

      this.stylistsSection = {
        sectionId,
        menuTitle,
        title,
        subtitle,
      };

      await this.screenshotHelper.capture(
        this.managePage,
        "manage-website-editor-after-stylists-section-save",
      );

      return this.stylistsSection;
    });
  }
}
