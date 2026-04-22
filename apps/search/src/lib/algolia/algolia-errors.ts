import { BaseError } from "@saleor/errors";

export const AlgoliaInvalidAppIdError = BaseError.subclass("AlgoliaInvalidAppIdError", {
  props: { _brand: "AlgoliaInvalidAppIdError" as const },
});
