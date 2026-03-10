import { expect, test } from "../fixtures/cross-app.fixture";

test.describe("Manage Salon webpage + Salon webpage", () => {
  test("creates a website section in Manage Salon and shows it on the public salon page", async ({
    scenario,
    managePage,
    publicPage,
  }) => {
    await scenario.iHaveASalon();
    const website = await scenario.iCreateAWebsiteInTheManageSalonWebpage();
    const section = await scenario.iAddACenterTextSectionInTheManageSalonWebpage(
      {
        menuTitle: "Unsere Geschichte",
        title: "Willkommen bei Playwright",
        content:
          "Dieser Abschnitt wurde im Manage Salon erstellt und im Salon-Webauftritt geprüft.",
      },
    );

    await expect(
      managePage.getByRole("heading", { name: "Webseite bearbeiten" }),
    ).toBeVisible();
    await expect(managePage.getByText(section.title, { exact: true })).toBeVisible();
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
});
