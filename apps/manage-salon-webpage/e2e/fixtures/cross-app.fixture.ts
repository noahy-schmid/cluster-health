import {
  expect,
  test as base,
  type BrowserContext,
  type Page,
} from "@playwright/test";
import { randomUUID } from "crypto";
import { ManagementUserRepository } from "@repo/auth-domain";
import { MediaLayer, SalonRepository } from "@repo/salon-domain";
import {
  CreateSectionUseCase,
  CreateSectionUseCaseLayer,
  ListSectionsUseCase,
  ListSectionsUseCaseLayer,
  UpdateSectionUseCase,
  UpdateSectionUseCaseLayer,
  WebsiteLayer,
  WebsiteService,
} from "@repo/website-domain";
import { Effect, Layer, Option } from "effect";
import { resetDatabase } from "../helpers/database";
import { e2eEnvironment } from "../env";

type ManagementAccount = {
  email: string;
  password: string;
  userId: string;
  sessionToken: string;
};

type SalonState = {
  salonId: string;
  name: string;
};

type WebsiteState = {
  websiteId: string;
  slug: string;
  title: string;
  publicUrl: string;
};

type CenterTextSectionState = {
  sectionId: string;
  menuTitle: string;
  title: string;
  content: string;
};

type WebsiteInput = {
  slug?: string;
  title?: string;
};

type CenterTextInput = {
  menuTitle?: string;
  title?: string;
  content?: string;
};

class CrossAppScenario {
  private readonly uniqueId = randomUUID();

  private managementAccount: ManagementAccount | undefined;
  private salon: SalonState | undefined;
  private website: WebsiteState | undefined;
  private centerTextSection: CenterTextSectionState | undefined;

  constructor(
    private readonly context: BrowserContext,
    private readonly managePage: Page,
    private readonly publicPage: Page,
    private readonly outputPath: (path: string) => string,
    private readonly attach: (
      name: string,
      options: { path: string; contentType: string },
    ) => Promise<void>,
  ) {}

  async iHaveASalon(): Promise<SalonState> {
    return base.step("I have a salon", async () => {
      if (this.salon) {
        return this.salon;
      }

      const account = await this.iHaveAManagementAccount();
      const salonRepository = new SalonRepository();
      const authRepository = new ManagementUserRepository();
      const name = `Playwright Salon ${this.uniqueId}`;

      const createResult = await salonRepository.createSalon({
        name,
        street: "Test Street 1",
        postalCode: "80331",
        city: "München",
        phone: "+49 89 123456",
      });

      if (!createResult.success) {
        throw new Error(createResult.errors);
      }

      const bindResult = await authRepository.bindSalonToUser(
        account.userId,
        createResult.data.id,
      );

      if (!bindResult.success) {
        throw new Error(bindResult.errors);
      }

      const tokenResult = await authRepository.issueTokenForUser(
        account.userId,
      );

      if (!tokenResult.success) {
        throw new Error(tokenResult.errors);
      }

      this.managementAccount = {
        ...account,
        sessionToken: tokenResult.data.token,
      };

      this.salon = {
        salonId: createResult.data.id,
        name,
      };

      await this.context.addCookies([
        {
          name: "session",
          value: tokenResult.data.token,
          url: e2eEnvironment.manageBaseUrl,
          httpOnly: true,
          sameSite: "Strict",
        },
      ]);

      return this.salon;
    });
  }

  async iHaveAWebsite(input: WebsiteInput = {}): Promise<WebsiteState> {
    return base.step("I have a website", async () => {
      if (this.website) {
        return this.website;
      }

      const { salonId } = await this.iHaveASalon();
      const slug = input.slug ?? `playwright-${this.uniqueId}`;
      const title = input.title ?? `Playwright Website ${this.uniqueId}`;

      const websiteId = await Effect.runPromise(
        Effect.gen(function* () {
          const websiteService = yield* WebsiteService;

          return yield* websiteService.createWebsite({
            salonId,
            slug,
            title,
            faviconMediaId: Option.none(),
          });
        }).pipe(Effect.provide(WebsiteLayer)),
      );

      this.website = {
        websiteId,
        slug,
        title,
        publicUrl: `${e2eEnvironment.salonBaseUrl}/salon/${slug}`,
      };

      return this.website;
    });
  }

  async iHaveACenterTextSection(
    input: CenterTextInput = {},
  ): Promise<CenterTextSectionState> {
    return base.step("I have a center text section", async () => {
      if (this.centerTextSection) {
        return this.centerTextSection;
      }

      const website = await this.iHaveAWebsite();
      const menuTitle = input.menuTitle ?? "Über uns";
      const title = input.title ?? `Willkommen ${this.uniqueId}`;
      const content =
        input.content ??
        "Dieser Abschnitt wurde über die Playwright-Fixture vorbereitet.";

      const position = await Effect.runPromise(
        Effect.gen(function* () {
          const listSectionsUseCase = yield* ListSectionsUseCase;
          const sections = yield* listSectionsUseCase.execute({
            websiteId: website.websiteId,
          });

          return sections.length;
        }).pipe(Effect.provide(ListSectionsUseCaseLayer)),
      );

      const createdSection = await Effect.runPromise(
        Effect.gen(function* () {
          const createSectionUseCase = yield* CreateSectionUseCase;

          return yield* createSectionUseCase.execute({
            websiteId: website.websiteId,
            type: "center-text",
            position,
          });
        }).pipe(Effect.provide(CreateSectionUseCaseLayer)),
      );

      await Effect.runPromise(
        Effect.gen(function* () {
          const updateSectionUseCase = yield* UpdateSectionUseCase;

          return yield* updateSectionUseCase.execute({
            ...createdSection,
            menuTitle,
            settings: {
              title,
              content,
            },
          });
        }).pipe(
          Effect.provide(Layer.merge(UpdateSectionUseCaseLayer, MediaLayer)),
        ),
      );

      this.centerTextSection = {
        sectionId: createdSection.id,
        menuTitle,
        title,
        content,
      };

      return this.centerTextSection;
    });
  }

  async iOpenTheWebsiteCreationScreen(): Promise<void> {
    await base.step(
      "I open the website creation screen in the Manage Salon webpage",
      async () => {
        const { salonId } = await this.iHaveASalon();

        await this.managePage.goto(
          `${e2eEnvironment.manageBaseUrl}/salon/${salonId}/website/create`,
        );
        await expect(
          this.managePage.getByRole("heading", { name: "Webseite erstellen" }),
        ).toBeVisible();
      },
    );
  }

  async iCreateAWebsiteInTheManageSalonWebpage(
    input: WebsiteInput = {},
  ): Promise<WebsiteState> {
    return base.step(
      "I create a website in the Manage Salon webpage",
      async () => {
        const { salonId } = await this.iHaveASalon();
        const slug = input.slug ?? `playwright-${this.uniqueId}`;
        const title = input.title ?? `Playwright Website ${this.uniqueId}`;

        await this.iOpenTheWebsiteCreationScreen();

        await this.managePage.getByTestId("website-slug-input").fill(slug);
        await this.managePage.getByTestId("website-title-input").fill(title);
        await this.managePage.getByTestId("website-save-button").click();

        await expect(this.managePage).toHaveURL(
          new RegExp(`/salon/${salonId}/website/[0-9a-f-]{36}$`),
        );

        const websiteId = this.extractWebsiteIdFromManageUrl();

        this.website = {
          websiteId,
          slug,
          title,
          publicUrl: `${e2eEnvironment.salonBaseUrl}/salon/${slug}`,
        };

        await this.captureScreenshot(
          this.managePage,
          "manage-website-editor-after-create",
        );

        return this.website;
      },
    );
  }

  async iAddACenterTextSectionInTheManageSalonWebpage(
    input: CenterTextInput = {},
  ): Promise<CenterTextSectionState> {
    return base.step(
      "I add a center text section in the Manage Salon webpage",
      async () => {
        const website =
          this.website ?? (await this.iCreateAWebsiteInTheManageSalonWebpage());
        const menuTitle = input.menuTitle ?? "Über uns";
        const title = input.title ?? `Willkommen ${this.uniqueId}`;
        const content =
          input.content ??
          "Dieser Abschnitt verbindet die Manage- und Salon-Webseiten im End-to-End-Test.";

        await this.managePage.goto(
          `${e2eEnvironment.manageBaseUrl}/salon/${(await this.iHaveASalon()).salonId}/website/${website.websiteId}`,
        );
        await this.managePage.getByTestId("add-section-button").first().click();

        await expect(this.managePage).toHaveURL(
          new RegExp(`/website/${website.websiteId}/select-section`),
        );

        await this.managePage.getByTestId("section-type-center-text").click();

        await expect(this.managePage).toHaveURL(
          new RegExp(
            `/website/${website.websiteId}/[0-9a-f-]{36}/center-text$`,
          ),
        );

        const sectionId = this.extractSectionIdFromManageUrl();

        await this.managePage
          .getByTestId("center-text-menu-title-input")
          .fill(menuTitle);
        await this.managePage
          .getByTestId("center-text-title-input")
          .fill(title);
        await this.managePage
          .getByTestId("center-text-content-input")
          .fill(content);
        await this.managePage.getByTestId("center-text-save-button").click();

        await expect(this.managePage).toHaveURL(
          new RegExp(`/website/${website.websiteId}$`),
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

        await this.captureScreenshot(
          this.managePage,
          "manage-website-editor-after-section-save",
        );

        return this.centerTextSection;
      },
    );
  }

  async iOpenMySalonWebsite(): Promise<WebsiteState> {
    return base.step("I open the public Salon webpage", async () => {
      const website = await this.iHaveAWebsite();

      await this.publicPage.goto(website.publicUrl);
      await expect(this.publicPage).toHaveURL(website.publicUrl);

      await this.captureScreenshot(this.publicPage, "public-salon-website");

      return website;
    });
  }

  private async iHaveAManagementAccount(): Promise<ManagementAccount> {
    return base.step("I have a management account", async () => {
      if (this.managementAccount) {
        return this.managementAccount;
      }

      const repository = new ManagementUserRepository();
      const email = `playwright-${this.uniqueId}@example.com`;
      const password = e2eEnvironment.managementPassword;

      const registerResult = await repository.registerUser(email, password);

      if (!registerResult.success) {
        throw new Error(registerResult.errors);
      }

      const authResult = await repository.authenticateCredentials(
        email,
        password,
      );

      if (!authResult.success) {
        throw new Error(authResult.errors);
      }

      this.managementAccount = {
        email,
        password,
        userId: authResult.data.payload.userId,
        sessionToken: authResult.data.token,
      };

      return this.managementAccount;
    });
  }

  private extractWebsiteIdFromManageUrl(): string {
    const { pathname } = new URL(this.managePage.url());
    const match = pathname.match(
      /^\/salon\/[^/]+\/website\/([0-9a-f-]{36})$/,
    );
    const websiteId = match?.[1];

    if (!websiteId) {
      throw new Error(`Could not extract websiteId from ${pathname}`);
    }

    return websiteId;
  }

  private extractSectionIdFromManageUrl(): string {
    const { pathname } = new URL(this.managePage.url());
    const match = pathname.match(
      /^\/salon\/[^/]+\/website\/[0-9a-f-]{36}\/([0-9a-f-]{36})\/center-text$/,
    );
    const sectionId = match?.[1];

    if (!sectionId) {
      throw new Error(`Could not extract sectionId from ${pathname}`);
    }

    return sectionId;
  }

  private async captureScreenshot(page: Page, name: string): Promise<void> {
    const path = this.outputPath(`${name}.png`);
    await page.screenshot({ path, fullPage: true });
    await this.attach(name, {
      path,
      contentType: "image/png",
    });
  }
}

type CrossAppFixtures = {
  appContext: BrowserContext;
  managePage: Page;
  publicPage: Page;
  scenario: CrossAppScenario;
};

export const test = base.extend<CrossAppFixtures>({
  appContext: async ({ browser }, consumeFixture) => {
    const context = await browser.newContext();
    await consumeFixture(context);
    await context.close();
  },
  managePage: async ({ appContext }, consumeFixture) => {
    const page = await appContext.newPage();
    await consumeFixture(page);
    await page.close();
  },
  publicPage: async ({ appContext }, consumeFixture) => {
    const page = await appContext.newPage();
    await consumeFixture(page);
    await page.close();
  },
  scenario: async (
    { appContext, managePage, publicPage },
    consumeFixture,
    testInfo,
  ) => {
    await resetDatabase();

    await consumeFixture(
      new CrossAppScenario(
        appContext,
        managePage,
        publicPage,
        testInfo.outputPath.bind(testInfo),
        testInfo.attach.bind(testInfo),
      ),
    );
  },
});

export { expect } from "@playwright/test";
