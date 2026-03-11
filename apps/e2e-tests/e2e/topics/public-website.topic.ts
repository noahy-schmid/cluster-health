import { expect, type Page, test as base } from "@playwright/test";
import { ScreenshotHelper } from "../helpers/screenshot-helper";
import type { WebsiteState } from "../helpers/types";
import type { WebsiteTopic } from "./website.topic";

export class PublicWebsiteTopic {
  constructor(
    private readonly publicPage: Page,
    private readonly websiteTopic: WebsiteTopic,
    private readonly screenshotHelper: ScreenshotHelper,
  ) {}

  async iOpenMySalonWebsite(): Promise<WebsiteState> {
    return base.step("I open the public Salon webpage", async () => {
      const website = await this.websiteTopic.iHaveAWebsite();

      await this.publicPage.goto(website.publicUrl);
      await expect(this.publicPage).toHaveURL(website.publicUrl);
      await this.screenshotHelper.capture(
        this.publicPage,
        "public-salon-website",
      );

      return website;
    });
  }
}
