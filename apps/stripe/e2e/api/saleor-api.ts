import { TypedDocumentNode } from "@graphql-typed-document-node/core";
import { APIRequestContext } from "@playwright/test";
import { env } from "e2e/env";
import {
  CheckoutCompleteDocument,
  CheckoutCreateDocument,
  CheckoutDeliveryMethodUpdateDocument,
  FetchProductDocument,
} from "e2e/generated/graphql";
import { print } from "graphql";

export class SaleorApi {
  private readonly request: APIRequestContext;

  constructor(request: APIRequestContext) {
    this.request = request;
  }

  private async callGraphqlApi<TResult, TVariables>(
    ast: TypedDocumentNode<TResult, TVariables>,
    ...[variables]: TVariables extends Record<string, never> ? [] : [TVariables]
  ): Promise<{ data: TResult }> {
    const response = await this.request.post(env.E2E_SALEOR_API_URL, {
      data: {
        // TODO: figure out if we need that?
        query: print(ast),
        variables,
      },
    });

    return response.json() as Promise<{ data: TResult }>;
  }

  private fetchProductVariant(channelSlug: string) {
    return this.callGraphqlApi(FetchProductDocument, {
      channelSlug,
    });
  }

  private updateCheckoutDeliveryMethod(args: { deliveryMethodId: string; checkoutId: string }) {
    return this.callGraphqlApi(CheckoutDeliveryMethodUpdateDocument, {
      deliveryMethodId: args.deliveryMethodId,
      checkoutId: args.checkoutId,
    });
  }

  async createCheckout(args: { channelSlug: string }) {
    const productResponse = await this.fetchProductVariant(args.channelSlug);

    const variantId = productResponse.data.products?.edges[0]?.node.defaultVariant?.id;

    if (!variantId) {
      throw new Error("No product variant found");
    }

    const createCheckoutResponse = await this.callGraphqlApi(CheckoutCreateDocument, {
      channelSlug: args.channelSlug,
      variantId,
      email: "saleor-app-payment-stripe-e2e-test@saleor.io",
    });

    const checkoutId = createCheckoutResponse.data.checkoutCreate?.checkout?.id;

    if (!checkoutId) {
      throw new Error("Checkout creation failed");
    }

    const deliveryMethodId =
      createCheckoutResponse.data.checkoutCreate?.checkout?.shippingMethods[0].id;

    if (!deliveryMethodId) {
      throw new Error("No delivery method found");
    }

    await this.updateCheckoutDeliveryMethod({
      deliveryMethodId,
      checkoutId,
    });

    return checkoutId;
  }

  async completeCheckout(args: { checkoutId: string }) {
    const completeCheckoutResponse = await this.callGraphqlApi(CheckoutCompleteDocument, {
      checkoutId: args.checkoutId,
    });

    const order = completeCheckoutResponse.data.checkoutComplete?.order;

    if (!order) {
      throw new Error("Checkout completion failed");
    }

    return order;
  }
}
