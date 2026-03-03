import ModernError from "modern-errors";
import modernErrorsSerialize from "modern-errors-serialize";

export const BaseError = ModernError.subclass("BaseError", {
  plugins: [modernErrorsSerialize],
  serialize: {
    exclude: ["stack"],
  },
  props: {
    _internalName: "change_me",
  } satisfies {
    _internalName: string;
  },
});

export const SaleorApiError = BaseError.subclass("SaleorApiError");

export const ScryfallApiError = BaseError.subclass("ScryfallApiError");
