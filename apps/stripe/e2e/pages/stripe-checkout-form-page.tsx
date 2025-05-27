import { Locator, Page } from "@playwright/test";
import { env } from "e2e/env";

export class StripeCheckoutFormPage {
  private readonly page: Page;
  readonly cardNumberInput: Locator;
  readonly cardExpiryInput: Locator;
  readonly cardCvcInput: Locator;
  readonly countryInput: Locator;
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
    this.countryInput = page
      .frameLocator('[title="Secure payment input frame"]')
      .locator('select[name="country"]');
    this.payButton = page.getByTestId("button-pay");
  }

  private constructPath(checkoutId: string) {
    const encodedGraphqlUrl = encodeURIComponent(env.E2E_SALEOR_API_URL);
    const gateway = "stripe";
    const appId = "saleor.app.payment.stripe-v2";

    return `/env/${encodedGraphqlUrl}/checkout/${checkoutId}/payment-gateway/${gateway}/${appId}`;
  }

  async goto(args: { checkoutId: string }) {
    await this.page.goto(this.constructPath(args.checkoutId));
  }

  async fillPaymentInformation() {
    await this.cardNumberInput.click();
    await this.cardNumberInput.fill("4242424242424242");

    await this.cardExpiryInput.click();
    await this.cardExpiryInput.fill("01/50");

    await this.cardCvcInput.click();
    await this.cardCvcInput.fill("123");

    // Default channels are set to Poland so we need to ensure the country is set to Poland as well to avoid issues with Stripe changing countries based on IP.
    await this.countryInput.selectOption("PL");
  }

  async pay() {
    await this.payButton.click();
  }
}
