import { test as base, type BrowserContext, type Page } from "@playwright/test";
import { createUniqueSuffix } from "../helpers/id-helper";
import { ScreenshotHelper } from "../helpers/screenshot-helper";
import type {
  CenterTextInput,
  StylistsSectionInput,
  StylistInput,
  WebsiteInput,
} from "../helpers/types";
import { AuthTopic } from "../topics/auth.topic";
import { PublicWebsiteTopic } from "../topics/public-website.topic";
import { SalonTopic } from "../topics/salon.topic";
import { StylistTopic } from "../topics/stylist.topic";
import { WebsiteTopic } from "../topics/website.topic";

class CrossAppScenario {
  readonly auth: AuthTopic;
  readonly salon: SalonTopic;
  readonly stylist: StylistTopic;
  readonly website: WebsiteTopic;
  readonly publicWebsite: PublicWebsiteTopic;
  private readonly screenshotHelper: ScreenshotHelper;
  private readonly managePage: Page;
  private readonly publicPage: Page;

  constructor(
    managePage: Page,
    publicPage: Page,
    screenshotHelper: ScreenshotHelper,
  ) {
    const uniqueSuffix = createUniqueSuffix();
    this.screenshotHelper = screenshotHelper;
    this.managePage = managePage;
    this.publicPage = publicPage;

    this.auth = new AuthTopic(managePage, uniqueSuffix);
    this.salon = new SalonTopic(managePage, this.auth, uniqueSuffix);
    this.stylist = new StylistTopic(managePage, this.salon, uniqueSuffix);
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

  async iAddAStylistsSection(input?: StylistsSectionInput) {
    return this.website.iAddAStylistsSection(input);
  }

  async iCreateAStylist(input?: StylistInput) {
    return this.stylist.iCreateAStylist(input);
  }

  async iOpenMySalonWebsite() {
    return this.publicWebsite.iOpenMySalonWebsite();
  }

  async iCaptureManagePage(name: string) {
    return this.screenshotHelper.capture(this.managePage, name);
  }

  async iCapturePublicPage(name: string) {
    return this.screenshotHelper.capture(this.publicPage, name);
  }
}

type CrossAppFixtures = {
  appContext: BrowserContext;
  managePage: Page;
  publicPage: Page;
  scenario: CrossAppScenario;
};

export const test = base.extend<CrossAppFixtures>({
  appContext: async ({ browser }, use, testInfo) => {
    const context = await browser.newContext({
      recordVideo: {
        dir: testInfo.outputDir,
        size: { width: 1280, height: 720 },
      },
    });
    await use(context);
    await context.close();
  },
  managePage: async ({ appContext }, use, testInfo) => {
    const page = await appContext.newPage();
    await use(page);
    const video = page.video();
    await page.close();
    if (video) {
      await testInfo.attach("manage-page-video", {
        path: await video.path(),
        contentType: "video/webm",
      });
    }
  },
  publicPage: async ({ appContext }, use, testInfo) => {
    const page = await appContext.newPage();
    await use(page);
    const video = page.video();
    await page.close();
    if (video) {
      await testInfo.attach("public-page-video", {
        path: await video.path(),
        contentType: "video/webm",
      });
    }
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
