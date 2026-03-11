import { expect, type Page, test as base } from "@playwright/test";
import { e2eEnvironment } from "../env";
import { ScreenshotHelper } from "../helpers/screenshot-helper";
import type {
  CenterTextInput,
  CenterTextSectionState,
  WebsiteInput,
  WebsiteState,
} from "../helpers/types";
import type { SalonTopic } from "./salon.topic";

const REORDER_SECTION_LABEL = "Abschnitt verschieben";

export class WebsiteTopic {
  private website: WebsiteState | undefined;

  private async expectCenterTextOrder(expectedTitles: string[]): Promise<void> {
    await expect
      .poll(async () =>
        this.managePage.locator("h4").evaluateAll((elements, titles) => {
          const expectedSet = new Set(titles as string[]);

          return elements
            .map((element) => element.textContent?.trim() ?? "")
            .filter((text) => expectedSet.has(text));
        }, expectedTitles),
      )
      .toEqual(expectedTitles);
  }

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
      const { salonId } = await this.salonTopic.iHaveASalon();
      const website = await this.iHaveAWebsite();
      const position = input.position;
      const menuTitle = input.menuTitle ?? "Über uns";
      const title = input.title ?? `Willkommen ${this.uniqueSuffix}`;
      const content =
        input.content ??
        "Dieser Abschnitt verbindet die Manage- und Salon-Webseiten im End-to-End-Test.";

      await this.managePage.goto(
        `${e2eEnvironment.manageBaseUrl}/salon/${salonId}/website/${website.websiteId}`,
      );
      const addSectionButtons =
        this.managePage.getByTestId("add-section-button");
      const buttonCount = await addSectionButtons.count();
      const targetPosition =
        position === undefined
          ? buttonCount - 1
          : Math.max(0, Math.min(position, buttonCount - 1));

      await addSectionButtons.nth(targetPosition).click();

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

      const centerTextSection = {
        sectionId,
        menuTitle,
        title,
        content,
      };

      await this.screenshotHelper.capture(
        this.managePage,
        "manage-website-editor-after-section-save",
      );

      return centerTextSection;
    });
  }

  async iReorderSection(
    fromPosition: number,
    toPosition: number,
    expectedTitles: string[],
  ): Promise<void> {
    await base.step("I reorder sections in the website editor", async () => {
      const { salonId } = await this.salonTopic.iHaveASalon();
      const website = await this.iHaveAWebsite();

      await this.managePage.goto(
        `${e2eEnvironment.manageBaseUrl}/salon/${salonId}/website/${website.websiteId}`,
      );

      const dragHandles = this.managePage.getByLabel(REORDER_SECTION_LABEL);
      const expectedHandleCount = expectedTitles.length + 1; // hero + sections
      await expect(dragHandles).toHaveCount(expectedHandleCount);

      await dragHandles
        .nth(fromPosition + 1)
        .dragTo(dragHandles.nth(toPosition + 1));

      await this.expectCenterTextOrder(expectedTitles);
      await this.screenshotHelper.capture(
        this.managePage,
        "manage-website-editor-after-section-reorder",
      );
    });
  }

  async iReloadWebsiteEditorAndExpectSectionOrder(
    expectedTitles: string[],
  ): Promise<void> {
    await base.step(
      "I reload the website editor and the section order stays persisted",
      async () => {
        await this.managePage.reload();
        await this.expectCenterTextOrder(expectedTitles);
        await this.screenshotHelper.capture(
          this.managePage,
          "manage-website-editor-after-reload",
        );
      },
    );
  }
}
