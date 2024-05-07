import { type GraphQLError, type GraphQLErrorExtensions } from "graphql";
import ModernError from "modern-errors";
import modernErrorsSerialize from "modern-errors-serialize";

export const BaseError = ModernError.subclass("BaseError", {
  props: {},
  plugins: [modernErrorsSerialize],
});

export const AppPermissionDeniedError = BaseError.subclass("AppPermissionDeniedError");
export const NetworkError = BaseError.subclass("NetworkError");
export const UnknownConnectionError = BaseError.subclass("UnknownConnectionError");

function getSaleorErrorExtensionCode(extension: GraphQLErrorExtensions) {
  return (extension?.exception as { code: string }).code;
}

export function doesErrorCodeExistsInErrors(errors: GraphQLError[] | undefined, code: string) {
  if (!errors) {
    return false;
  }

  return errors.some((error) => getSaleorErrorExtensionCode(error.extensions) === code);
}
