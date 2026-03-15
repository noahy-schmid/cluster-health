import { expect, test } from "../fixtures/cross-app.fixture";
import path from "path";

const repositoryRoot = path.resolve(__dirname, "../../../..");

test.describe("Manage Salon webpage + Salon webpage", () => {
  test.describe.configure({ timeout: 120_000 });

  test("creates a website section in Manage Salon and shows it on the public salon page", async ({
    scenario,
    managePage,
    publicPage,
  }) => {
    await scenario.iHaveAnAccount();
    await scenario.iHaveASalon();
    const website = await scenario.iHaveAWebsite();
    const section = await scenario.iAddACenterTextSection({
      menuTitle: "Unsere Geschichte",
      title: "Willkommen bei Playwright",
      content:
        "Dieser Abschnitt wurde im Manage Salon erstellt und im Salon-Webauftritt geprüft.",
    });

    await expect(
      managePage.getByRole("heading", { name: "Webseite bearbeiten" }),
    ).toBeVisible();
    await expect(
      managePage.getByText(section.title, { exact: true }),
    ).toBeVisible();
    await expect(
      managePage.getByText(section.menuTitle, { exact: true }),
    ).toBeVisible();

    await scenario.iOpenMySalonWebsite();

    await expect(
      publicPage.getByRole("heading", { name: section.title }),
    ).toBeVisible();
    await expect(publicPage.getByText(section.content)).toBeVisible();
    await expect(
      publicPage.getByRole("button", { name: section.menuTitle }),
    ).toBeVisible();
    await expect(publicPage).toHaveURL(website.publicUrl);
  });

  test("creates stylists with profile images and shows them in the public stylists section", async ({
    scenario,
    managePage,
    publicPage,
  }) => {
    const firstStylistImagePath = path.resolve(
      repositoryRoot,
      "apps/salon-webpage/public/images/hair.png",
    );
    const secondStylistImagePath = path.resolve(
      repositoryRoot,
      "apps/salon-webpage/public/images/house.png",
    );

    await scenario.iHaveAnAccount();
    await scenario.iHaveASalon();
    const website = await scenario.iHaveAWebsite();
    const stylistsSection = await scenario.iAddAStylistsSection({
      menuTitle: "Team",
      title: "Unser Styling Team",
      subtitle: "Zwei Playwright Stylisten mit Profilbildern.",
    });
    const firstStylist = await scenario.iCreateAStylist({
      name: "Playwright Stylist One",
      subtitle: "Master Stylist",
      description: "Spezialisiert auf moderne Schnitte und Styling.",
      profileImagePath: firstStylistImagePath,
    });

    await scenario.iOpenMySalonWebsite();

    await expect(
      publicPage.getByRole("heading", { name: stylistsSection.title }),
    ).toBeVisible();
    await expect(publicPage.getByText(stylistsSection.subtitle)).toBeVisible();
    await expect(
      publicPage.getByRole("button", { name: stylistsSection.menuTitle }),
    ).toBeVisible();
    await expect(
      publicPage.getByRole("heading", { name: firstStylist.name }),
    ).toBeVisible();
    await expect(publicPage.getByText(firstStylist.subtitle)).toBeVisible();
    await expect(publicPage.getByAltText(firstStylist.name)).toBeVisible();
    await expect(publicPage.getByAltText(firstStylist.name)).toHaveAttribute(
      "src",
      /salon-media/,
    );
    await expect(publicPage).toHaveURL(website.publicUrl);

    const secondStylist = await scenario.iCreateAStylist({
      name: "Playwright Stylist Two",
      subtitle: "Color Specialist",
      description: "Bekannt für individuelle Farben und Beratung.",
      profileImagePath: secondStylistImagePath,
    });

    await expect(
      managePage.getByRole("heading", { name: secondStylist.name }),
    ).toBeVisible();
    await expect(managePage.getByAltText(firstStylist.name)).toBeVisible();
    await expect(managePage.getByAltText(secondStylist.name)).toBeVisible();
    await scenario.iCaptureManagePage("manage-stylists-with-two-stylists");

    await scenario.iOpenMySalonWebsite();
    await publicPage.setViewportSize({ width: 1600, height: 1200 });

    await expect(
      publicPage.getByRole("heading", { name: firstStylist.name }),
    ).toBeVisible();
    await expect(
      publicPage.getByRole("heading", { name: secondStylist.name }),
    ).toBeVisible();
    await expect(publicPage.getByText(secondStylist.subtitle)).toBeVisible();
    await expect(publicPage.getByAltText(firstStylist.name)).toHaveAttribute(
      "src",
      /salon-media/,
    );
    await expect(publicPage.getByAltText(secondStylist.name)).toHaveAttribute(
      "src",
      /salon-media/,
    );
    await scenario.iCapturePublicPage("public-salon-website-with-two-stylists");
  });
});
