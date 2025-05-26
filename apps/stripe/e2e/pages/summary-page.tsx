import { Locator, Page } from "@playwright/test";

export class SummaryPage {
  private readonly page: Page;
  readonly processSessionButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.processSessionButton = page.getByTestId("button-force-process-session");
  }

  async processSession() {
    await this.processSessionButton.click();
    await this.page.waitForTimeout(1000); // Wait for 1 second to ensure the session is processed
  }
}
