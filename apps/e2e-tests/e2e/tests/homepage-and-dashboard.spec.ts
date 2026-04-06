import { expect, test } from "../fixtures/cross-app.fixture.js";
import { e2eEnvironment } from "../env.js";

test.describe("Landing page and dashboard", () => {
  test.describe.configure({ timeout: 120_000 });

  test("shows login and register buttons when not logged in", async ({
    managePage,
  }) => {
    await managePage.goto(`${e2eEnvironment.manageBaseUrl}/`);

    await expect(
      managePage.getByRole("link", { name: "Anmelden" }),
    ).toBeVisible();
    await expect(
      managePage.getByRole("link", { name: "Registrieren" }),
    ).toBeVisible();

    // No dashboard button when logged out
    await expect(
      managePage.getByRole("link", { name: "Zum Dashboard" }),
    ).not.toBeVisible();
  });

  test("shows dashboard button when logged in", async ({
    scenario,
    managePage,
  }) => {
    await scenario.iHaveAnAccount();
    await scenario.iHaveASalon();

    await managePage.goto(`${e2eEnvironment.manageBaseUrl}/`);

    await expect(
      managePage.getByRole("link", { name: "Zum Dashboard" }),
    ).toBeVisible();

    // No login/register buttons when logged in
    await expect(
      managePage.getByRole("link", { name: "Anmelden" }),
    ).not.toBeVisible();
    await expect(
      managePage.getByRole("link", { name: "Registrieren" }),
    ).not.toBeVisible();
  });

  test("navigates to dashboard from landing page when logged in", async ({
    scenario,
    managePage,
  }) => {
    await scenario.iHaveAnAccount();
    const salon = await scenario.iHaveASalon();

    await managePage.goto(`${e2eEnvironment.manageBaseUrl}/`);

    await managePage.getByRole("link", { name: "Zum Dashboard" }).click();

    await expect(managePage).toHaveURL(
      `${e2eEnvironment.manageBaseUrl}/salon/${salon.salonId}`,
    );
  });

  test("salon dashboard shows widgets and header", async ({
    scenario,
    managePage,
  }) => {
    await scenario.iHaveAnAccount();
    const salon = await scenario.iHaveASalon();

    await managePage.goto(
      `${e2eEnvironment.manageBaseUrl}/salon/${salon.salonId}`,
    );

    await expect(
      managePage.getByRole("heading", { name: "Dashboard" }),
    ).toBeVisible();

    // Default widgets should be visible
    await expect(managePage.getByText("Heutige Termine")).toBeVisible();
    await expect(managePage.getByText("Gesamtkunden")).toBeVisible();
  });

  test("salon dashboard shows stylist selector when stylists exist", async ({
    scenario,
    managePage,
  }) => {
    await scenario.iHaveAnAccount();
    const salon = await scenario.iHaveASalon();

    // Create a stylist
    await scenario.iCreateAStylist({ name: "Playwright Stylist Dashboard" });

    // Navigate to dashboard
    await managePage.goto(
      `${e2eEnvironment.manageBaseUrl}/salon/${salon.salonId}`,
    );

    await expect(
      managePage.getByRole("heading", { name: "Dashboard" }),
    ).toBeVisible();

    // Stylist selector should be visible
    await expect(
      managePage.getByRole("button", { name: "Stylist auswählen" }),
    ).toBeVisible();

    // Open the selector
    await managePage
      .getByRole("button", { name: "Stylist auswählen" })
      .click();

    // Stylist name should appear in dropdown
    await expect(
      managePage.getByRole("button", { name: "Playwright Stylist Dashboard" }),
    ).toBeVisible();
  });

  test("salon dashboard allows adding and removing widgets", async ({
    scenario,
    managePage,
  }) => {
    await scenario.iHaveAnAccount();
    const salon = await scenario.iHaveASalon();

    await managePage.goto(
      `${e2eEnvironment.manageBaseUrl}/salon/${salon.salonId}`,
    );

    // Remove one widget
    const removeButtons = managePage.getByRole("button", {
      name: "Widget entfernen",
    });
    const initialCount = await removeButtons.count();
    expect(initialCount).toBeGreaterThan(0);
    await removeButtons.first().click();

    await expect(
      managePage.getByRole("button", { name: "Widget entfernen" }),
    ).toHaveCount(initialCount - 1);

    // Open add widget panel
    await managePage
      .getByRole("button", { name: "Widget hinzufügen" })
      .click();

    // Panel should show widget type options
    await expect(managePage.getByText("Widget hinzufügen", { exact: true })).toBeVisible();
    await expect(managePage.getByText("Gesamtkunden")).toBeVisible();
  });
});
