import type { Page, TestInfo } from "@playwright/test";

export class ScreenshotHelper {
  constructor(private readonly testInfo: TestInfo) {}

  async capture(page: Page, name: string): Promise<void> {
    const path = this.testInfo.outputPath(`${name}.png`);
    await page.screenshot({ path, fullPage: true });
    await this.testInfo.attach(name, {
      path,
      contentType: "image/png",
    });
  }
}
