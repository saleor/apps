import { useMutation } from "@tanstack/react-query";
import request from "graphql-request";
import { useParams } from "next/navigation";

import { graphql } from "@/graphql/gql";
import { BaseError, UnknownError } from "@/lib/errors";

const CompleteCheckoutMutation = graphql(`
  mutation CompleteCheckout($checkoutId: ID!) {
    checkoutComplete(id: $checkoutId) {
      order {
        id
      }
      errors {
        field
        message
        code
      }
    }
  }
`);

const CreateCheckoutMutationError = BaseError.subclass("CreateCheckoutMutationError");

export const useCompleteCheckoutMutation = () => {
  const params = useParams<{
    envUrl: string;
    checkoutId: string;
  }>();
  const envUrl = decodeURIComponent(params.envUrl);
  const checkoutId = decodeURIComponent(params.checkoutId);

  const completeCheckoutMutation = useMutation({
    mutationFn: async () => {
      const response = await request(envUrl, CompleteCheckoutMutation, {
        checkoutId,
      }).catch((error) => {
        throw BaseError.normalize(error, UnknownError);
      });

      if ((response.checkoutComplete?.errors ?? []).length > 0) {
        throw new CreateCheckoutMutationError(
          "Failed to create checkout - errors in completeCheckout mutation.",
          {
            errors: response.checkoutComplete?.errors.map((e) =>
              CreateCheckoutMutationError.normalize(e),
            ),
          },
        );
      }

      return response;
    },
    mutationKey: ["completeCheckout"],
    useErrorBoundary: true,
  });

  return completeCheckoutMutation;
};
