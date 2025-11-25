import { z } from "zod";
import { err, ok, Result } from "neverthrow";
import { BaseError } from "@/lib/errors";

export const shopifyConnectionConfigSchema = z.object({
  shopDomain: z.string().min(1, "Shop domain is required"),
  accessToken: z.string().min(1, "Access token is required"),
  apiVersion: z.string().default("2024-10"),
});

export type ShopifyConnectionConfigInput = z.input<typeof shopifyConnectionConfigSchema>;

export class ShopifyConnectionConfig {
  readonly shopDomain: string;
  readonly accessToken: string;
  readonly apiVersion: string;

  private constructor(shopDomain: string, accessToken: string, apiVersion: string) {
    this.shopDomain = shopDomain;
    this.accessToken = accessToken;
    this.apiVersion = apiVersion;
  }

  static ValidationError = BaseError.subclass("ValidationError", {
    props: { _brand: "ShopifyConnectionConfig.ValidationError" as const },
  });

  static create(
    input: ShopifyConnectionConfigInput
  ): Result<ShopifyConnectionConfig, InstanceType<typeof ShopifyConnectionConfig.ValidationError>> {
    const parsed = shopifyConnectionConfigSchema.safeParse(input);

    if (!parsed.success) {
      return err(
        new ShopifyConnectionConfig.ValidationError("Invalid Shopify connection config", {
          cause: parsed.error,
        })
      );
    }

    return ok(
      new ShopifyConnectionConfig(
        parsed.data.shopDomain,
        parsed.data.accessToken,
        parsed.data.apiVersion
      )
    );
  }

  toJSON(): ShopifyConnectionConfigInput {
    return {
      shopDomain: this.shopDomain,
      accessToken: this.accessToken,
      apiVersion: this.apiVersion,
    };
  }

  getShopifyGraphQLEndpoint(): string {
    const normalizedDomain = this.shopDomain.replace(/^https?:\/\//, "").replace(/\/$/, "");

    return `https://${normalizedDomain}/admin/api/${this.apiVersion}/graphql.json`;
  }
}
