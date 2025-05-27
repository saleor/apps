import { Locator, Page } from "@playwright/test";

export class SummaryPage {
  private readonly page: Page;
  readonly processSessionButton: Locator;
  readonly successToast: Locator;

  constructor(page: Page) {
    this.page = page;
    this.processSessionButton = page.getByTestId("button-force-process-session");
    this.successToast = page.getByTestId("toast-description");
  }

  async processSession() {
    await this.page.waitForLoadState("networkidle");
    await this.processSessionButton.click();
  }
}
