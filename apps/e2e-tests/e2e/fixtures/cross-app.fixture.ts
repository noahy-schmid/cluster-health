import { test as base, type BrowserContext, type Page } from "@playwright/test";
import { createUniqueSuffix } from "../helpers/id-helper";
import { ScreenshotHelper } from "../helpers/screenshot-helper";
import type { CenterTextInput, WebsiteInput } from "../helpers/types";
import { AuthTopic } from "../topics/auth.topic";
import { PublicWebsiteTopic } from "../topics/public-website.topic";
import { SalonTopic } from "../topics/salon.topic";
import { WebsiteTopic } from "../topics/website.topic";

class CrossAppScenario {
  readonly auth: AuthTopic;
  readonly salon: SalonTopic;
  readonly website: WebsiteTopic;
  readonly publicWebsite: PublicWebsiteTopic;

  constructor(
    managePage: Page,
    publicPage: Page,
    screenshotHelper: ScreenshotHelper,
  ) {
    const uniqueSuffix = createUniqueSuffix();

    this.auth = new AuthTopic(managePage, uniqueSuffix);
    this.salon = new SalonTopic(managePage, this.auth, uniqueSuffix);
    this.website = new WebsiteTopic(
      managePage,
      this.salon,
      screenshotHelper,
      uniqueSuffix,
    );
    this.publicWebsite = new PublicWebsiteTopic(
      publicPage,
      this.website,
      screenshotHelper,
    );
  }

  async iHaveAnAccount() {
    return this.auth.iHaveAnAccount();
  }

  async iHaveASalon() {
    return this.salon.iHaveASalon();
  }

  async iHaveAWebsite(input?: WebsiteInput) {
    return this.website.iHaveAWebsite(input);
  }

  async iAddACenterTextSection(input?: CenterTextInput) {
    return this.website.iAddACenterTextSection(input);
  }

  async iReorderWebsiteSections(
    fromPosition: number,
    toPosition: number,
    expectedTitles: string[],
  ) {
    return this.website.iReorderSection(
      fromPosition,
      toPosition,
      expectedTitles,
    );
  }

  async iReloadWebsiteEditorAndExpectSectionOrder(expectedTitles: string[]) {
    return this.website.iReloadWebsiteEditorAndExpectSectionOrder(
      expectedTitles,
    );
  }

  async iOpenMySalonWebsite() {
    return this.publicWebsite.iOpenMySalonWebsite();
  }
}

type CrossAppFixtures = {
  appContext: BrowserContext;
  managePage: Page;
  publicPage: Page;
  scenario: CrossAppScenario;
};

export const test = base.extend<CrossAppFixtures>({
  appContext: async ({ browser }, use) => {
    const context = await browser.newContext();
    await use(context);
    await context.close();
  },
  managePage: async ({ appContext }, use) => {
    const page = await appContext.newPage();
    await use(page);
    await page.close();
  },
  publicPage: async ({ appContext }, use) => {
    const page = await appContext.newPage();
    await use(page);
    await page.close();
  },
  scenario: async ({ managePage, publicPage }, use, testInfo) => {
    await use(
      new CrossAppScenario(
        managePage,
        publicPage,
        new ScreenshotHelper(testInfo),
      ),
    );
  },
});

export { expect } from "@playwright/test";
