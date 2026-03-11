import { expect, test } from "../fixtures/cross-app.fixture";

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

  test("inserts a section at the front and keeps the public menu order in sync", async ({
    scenario,
    publicPage,
  }) => {
    await scenario.iHaveAnAccount();
    await scenario.iHaveASalon();
    const website = await scenario.iHaveAWebsite();

    const firstSection = await scenario.iAddACenterTextSection({
      menuTitle: "Erster Abschnitt",
      title: "Erste Reihenfolge",
      content: "Dieser Abschnitt wird zuerst erstellt.",
    });
    const secondSection = await scenario.iAddACenterTextSection({
      menuTitle: "Zweiter Abschnitt",
      title: "Zweite Reihenfolge",
      content: "Dieser Abschnitt wird danach erstellt.",
    });
    const insertedSection = await scenario.iAddACenterTextSection({
      position: 0,
      menuTitle: "Neuer erster Abschnitt",
      title: "Ganz vorne",
      content: "Dieser Abschnitt wird nachträglich an Position 0 eingefügt.",
    });

    await scenario.iOpenMySalonWebsite();

    const expectedMenuOrder = [
      insertedSection.menuTitle,
      firstSection.menuTitle,
      secondSection.menuTitle,
    ];

    await expect(
      publicPage.getByRole("heading", { name: insertedSection.title }),
    ).toBeVisible();
    await expect(publicPage).toHaveURL(website.publicUrl);
    await expect
      .poll(async () =>
        publicPage.locator("button").evaluateAll((elements, expectedTitles) => {
          const expectedSet = new Set(expectedTitles as string[]);

          return elements
            .map((element) => element.textContent?.trim() ?? "")
            .filter((text) => expectedSet.has(text));
        }, expectedMenuOrder),
      )
      .toEqual(expectedMenuOrder);
  });
});
