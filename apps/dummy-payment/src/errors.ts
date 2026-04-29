import ModernError from "modern-errors";
import ModernErrorsSerialize from "modern-errors-serialize";

export const BaseError = ModernError.subclass("BaseError", {
  plugins: [ModernErrorsSerialize],
});

export const UnknownError = BaseError.subclass("UnknownError");
