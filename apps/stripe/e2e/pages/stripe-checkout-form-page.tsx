import { Locator, Page } from "@playwright/test";

export class StripeCheckoutFormPage {
  private readonly page: Page;
  readonly cardNumberInput: Locator;
  readonly cardExpiryInput: Locator;
  readonly cardCvcInput: Locator;
  readonly payButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.cardNumberInput = page
      .frameLocator('[title="Secure payment input frame"]')
      .locator('input[name="number"]');
    this.cardExpiryInput = page
      .frameLocator('[title="Secure payment input frame"]')
      .locator('input[name="expiry"]');
    this.cardCvcInput = page
      .frameLocator('[title="Secure payment input frame"]')
      .locator('input[name="cvc"]');
    this.payButton = page.getByTestId("button-pay");
  }

  private constructPath(checkoutId: string) {
    const encodedGraphqlUrl = encodeURIComponent(
      "https://ext-team-latest-e2e.staging.saleor.cloud/graphql/",
    );
    const gateway = "stripe";
    const appId = "saleor.app.payment.stripe-v2";

    return `/env/${encodedGraphqlUrl}/checkout/${checkoutId}/payment-gateway/${gateway}/${appId}`;
  }

  async goto(args: { checkoutId: string }) {
    await this.page.goto(this.constructPath(args.checkoutId));
  }

  async fillCardInformation() {
    await this.cardNumberInput.click();
    await this.cardNumberInput.fill("4242424242424242");

    await this.cardExpiryInput.click();
    await this.cardExpiryInput.fill("01/50");

    await this.cardCvcInput.click();
    await this.cardCvcInput.fill("123");
  }

  async pay() {
    await this.payButton.click();
  }
}
