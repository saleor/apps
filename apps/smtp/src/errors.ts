import ModernError from "modern-errors";
import modernErrorsSerialize from "modern-errors-serialize";

export const BaseError = ModernError.subclass("BaseError", {
  props: {},
  plugins: [modernErrorsSerialize],
});
