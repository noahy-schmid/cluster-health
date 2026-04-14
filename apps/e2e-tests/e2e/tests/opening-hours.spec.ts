import { expect, test } from "../fixtures/cross-app.fixture.js";

/**
 * Returns the ISO date string (YYYY-MM-DD) for a date that is `daysFromNow`
 * days in the future – always within the initially-loaded 28-day window.
 */
function futureDateStr(daysFromNow: number): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + daysFromNow);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

test.describe("Opening hours management", () => {
  test.describe.configure({ timeout: 120_000 });

  test("shows the opening-hours page with a scrollable date list", async ({
    scenario,
    managePage,
  }) => {
    await scenario.iHaveAnAccount();
    await scenario.iHaveASalon();
    await scenario.iGoToOpeningHours();

    // The date list container is rendered
    await expect(managePage.getByTestId("opening-hours-list")).toBeVisible();

    // At least the row for tomorrow is visible
    const tomorrow = futureDateStr(1);
    await expect(managePage.getByTestId(`date-row-${tomorrow}`)).toBeVisible();

    // All rows initially show "Geschlossen" (no schedule set yet)
    const rows = managePage.getByTestId("opening-hours-list").locator("button");
    const firstRowText = await rows.first().textContent();
    expect(firstRowText).toContain("Geschlossen");
  });

  test("sets a specific date as open (just this day) and shows it as an exception", async ({
    scenario,
  }) => {
    await scenario.iHaveAnAccount();
    await scenario.iHaveASalon();
    await scenario.iGoToOpeningHours();

    const targetDate = futureDateStr(3);

    const state = await scenario.iSetOpeningHoursForDate(
      { date: targetDate, isOpen: true, openTime: "10:00", closeTime: "17:00" },
      "just-this-day",
    );

    expect(state.appliedAs).toBe("exception");
    expect(state.isOpen).toBe(true);

    // Row should now show the times
    await scenario.iSeeDateAs(targetDate, {
      isOpen: true,
      openTime: "10:00",
      closeTime: "17:00",
    });

    // Row should carry the "Ausnahme" badge
    await scenario.iSeeDateHasExceptionBadge(targetDate);
  });

  test("sets a specific date as closed (just this day) and shows it as an exception", async ({
    scenario,
  }) => {
    await scenario.iHaveAnAccount();
    await scenario.iHaveASalon();
    await scenario.iGoToOpeningHours();

    const targetDate = futureDateStr(5);

    const state = await scenario.iSetOpeningHoursForDate(
      { date: targetDate, isOpen: false },
      "just-this-day",
    );

    expect(state.appliedAs).toBe("exception");
    expect(state.isOpen).toBe(false);

    await scenario.iSeeDateAs(targetDate, { isOpen: false });
    await scenario.iSeeDateHasExceptionBadge(targetDate);
  });

  test("applies open hours to every weekday and all matching dates update", async ({
    scenario,
    managePage,
  }) => {
    await scenario.iHaveAnAccount();
    await scenario.iHaveASalon();
    await scenario.iGoToOpeningHours();

    // Pick a date 7 days out so there is a second occurrence of the same
    // weekday at +14 days that is also visible in the initial window.
    const targetDate = futureDateStr(7);
    const sameWeekdayLater = futureDateStr(14);

    await scenario.iSetOpeningHoursForDate(
      { date: targetDate, isOpen: true, openTime: "09:00", closeTime: "18:00" },
      "every-weekday",
    );

    // The target date itself should now show the hours (no Ausnahme badge)
    await scenario.iSeeDateAs(targetDate, {
      isOpen: true,
      openTime: "09:00",
      closeTime: "18:00",
    });

    // The same weekday one week later should also show the hours from the
    // weekly rule (no exception badge)
    await scenario.iSeeDateAs(sameWeekdayLater, {
      isOpen: true,
      openTime: "09:00",
      closeTime: "18:00",
    });

    // Neither should have an exception badge – they inherit from the weekly rule
    const laterRow = managePage.getByTestId(`date-row-${sameWeekdayLater}`);
    await expect(laterRow.getByText("Ausnahme")).not.toBeVisible();
  });

  test("navigates to opening hours via the navigation menu", async ({
    scenario,
    managePage,
  }) => {
    await scenario.iHaveAnAccount();
    await scenario.iHaveASalon();

    // On mobile the sidebar is hidden behind the hamburger menu; open it first
    const viewport = managePage.viewportSize();
    const isMobile = viewport !== null && viewport.width < 1024;
    if (isMobile) {
      await managePage.getByRole("button", { name: "Open menu" }).click();
      await expect(
        managePage.getByRole("link", { name: "Öffnungszeiten" }),
      ).toBeVisible({ timeout: 5_000 });
    }

    await managePage
      .getByRole("link", { name: "Öffnungszeiten" })
      .first()
      .click();

    await expect(
      managePage.getByRole("heading", { name: "Öffnungszeiten" }),
    ).toBeVisible({ timeout: 10_000 });
    await expect(managePage.getByTestId("opening-hours-list")).toBeVisible();
  });
});
