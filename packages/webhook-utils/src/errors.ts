import { type GraphQLError, type GraphQLErrorExtensions } from "graphql";
import ModernError from "modern-errors";
import modernErrorsSerialize from "modern-errors-serialize";

export const BaseError = ModernError.subclass("BaseError", {
  props: {},
  plugins: [modernErrorsSerialize],
});

export const WebhookMigrationAppPermissionDeniedError = BaseError.subclass(
  "WebhookMigrationAppPermissionDeniedError",
);
export const WebhookMigrationNetworkError = BaseError.subclass("NetworkError");
export const WebhookMigrationUnknownError = BaseError.subclass("WebhookMigrationUnknownError");

function getSaleorErrorExtensionCode(extension: GraphQLErrorExtensions) {
  return (extension?.exception as { code: string }).code;
}

export function doesErrorCodeExistsInErrors(errors: GraphQLError[] | undefined, code: string) {
  if (!errors) {
    return false;
  }

  return errors.some((error) => getSaleorErrorExtensionCode(error.extensions) === code);
}
