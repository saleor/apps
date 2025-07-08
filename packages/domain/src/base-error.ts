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
    _brand: "change_me",
  } satisfies {
    _brand: string;
  },
});
