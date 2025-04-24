import ModernError from "modern-errors";
import modernErrorsSerialize from "modern-errors-serialize";

export const BaseError = ModernError.subclass("BaseError", {
  plugins: [modernErrorsSerialize],
  serialize: {
    exclude: ["stack"],
  },
  props: {
    /**
     * Add _internalName to force nominal typing
     */
    _internalName: "change_me",
  } satisfies {
    _internalName: string;
  },
});

export const UnknownError = BaseError.subclass("UnknownError");

export const ValueError = BaseError.subclass("ValueError");
