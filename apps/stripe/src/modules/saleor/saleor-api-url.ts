import { err, ok } from "neverthrow";

import { BaseError } from "@/lib/errors";

export class SaleorApiUrl {
  public readonly url;

  static ValidationError = BaseError.subclass("ValidationError");

  private constructor(url: string) {
    this.url = url;
  }

  static create(args: { url: string }) {
    if (args.url.length === 0) {
      return err(new SaleorApiUrl.ValidationError("Saleor API URL cannot be empty"));
    }
    if (!args.url.startsWith("http://") && !args.url.startsWith("https://")) {
      return err(new SaleorApiUrl.ValidationError("Saleor API URL must start with http / https"));
    }
    if (!args.url.endsWith("/graphql/")) {
      return err(new SaleorApiUrl.ValidationError("Saleor API URL must end with /graphql/"));
    }

    return ok(new SaleorApiUrl(args.url));
  }
}
