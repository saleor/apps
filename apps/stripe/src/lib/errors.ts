import ModernError from "modern-errors";
import modernErrorsSerialize from "modern-errors-serialize";

export const BaseError = ModernError.subclass("BaseError", {
  plugins: [modernErrorsSerialize],
  serialize: {
    exclude: ["stack"],
  },
});

export const UnknownError = BaseError.subclass("UnknownError");

export const UseCaseMissingConfigError = BaseError.subclass("UseCaseMissingConfigError", {
  props: {
    // use _internalName to allow TypeScript to infer specific type of this error - as opposed to allowing all BaseError types
    _internalName: "UseCaseMissingConfigError" as const,
    channelId: "",
    httpStatusCode: 400,
    // TODO: what should be the response here?
    httpMessage: "App is not configured",
  },
});

export const UseCaseGetConfigError = BaseError.subclass("UseCaseGetConfigError", {
  props: {
    _internalName: "UseCaseGetConfigError" as const,
    httpStatusCode: 400,
    // TODO: what should be the response here?
    httpMessage: "App is not configured",
  },
});
