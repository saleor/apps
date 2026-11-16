import request, { type RequestDocument, type Variables } from "graphql-request";
import { z } from "zod";

import { graphql } from "@/graphql/gql";
import { BaseError, UnknownError } from "@/lib/errors";
import { saleorRequestHeaders } from "@/lib/saleor-request-headers";

export const accountErrorSchema = z.object({
  field: z.string().nullable(),
  message: z.string().nullable(),
  code: z.string(),
});

export const customerSessionInputSchema = z.object({
  token: z.string().min(1),
  refreshToken: z.string().min(1),
});

type CustomerSessionError = {
  code: string;
  field: string | null;
  message: string;
};

const RefreshCustomerTokenSchema = z.object({
  tokenRefresh: z
    .object({
      token: z.string().nullable(),
      user: z
        .object({
          id: z.string(),
          email: z.string(),
        })
        .nullable(),
      errors: z.array(accountErrorSchema),
    })
    .nullable(),
});

const RefreshCustomerTokenMutation = graphql(`
  mutation RefreshSquareTestCustomerToken($refreshToken: String!) {
    tokenRefresh(refreshToken: $refreshToken) {
      token
      user {
        id
        email
      }
      errors {
        field
        message
        code
      }
    }
  }
`);

const RefreshCustomerTokenParsingResponseError = BaseError.subclass(
  "RefreshCustomerTokenParsingResponseError",
);

const getCustomerSessionExpiredError = (): CustomerSessionError => ({
  code: "CUSTOMER_SESSION_EXPIRED",
  field: null,
  message: "Customer session expired. Log in again.",
});

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const getGraphQLErrors = (error: unknown) => {
  if (!isRecord(error) || !isRecord(error.response)) {
    return [];
  }

  return Array.isArray(error.response.errors) ? error.response.errors.filter(isRecord) : [];
};

const getExceptionCode = (error: Record<string, unknown>) => {
  if (!isRecord(error.extensions) || !isRecord(error.extensions.exception)) {
    return null;
  }

  return typeof error.extensions.exception.code === "string"
    ? error.extensions.exception.code
    : null;
};

const isCustomerTokenExpiredError = (error: unknown) =>
  getGraphQLErrors(error).some((graphQLError) => {
    const message = typeof graphQLError.message === "string" ? graphQLError.message : "";

    return (
      message.includes("Signature has expired") ||
      getExceptionCode(graphQLError) === "ExpiredSignatureError"
    );
  });

const refreshCustomerToken = async ({
  envUrl,
  refreshToken,
}: {
  envUrl: string;
  refreshToken: string;
}) => {
  let response: unknown;

  try {
    response = await request(
      envUrl,
      RefreshCustomerTokenMutation,
      {
        refreshToken,
      },
      saleorRequestHeaders,
    );
  } catch (error) {
    if (isCustomerTokenExpiredError(error)) {
      return {
        status: "error" as const,
        error: getCustomerSessionExpiredError(),
      };
    }

    throw BaseError.normalize(error, UnknownError);
  }

  const parsedResponse = RefreshCustomerTokenSchema.safeParse(response);

  if (parsedResponse.error) {
    throw RefreshCustomerTokenParsingResponseError.normalize(parsedResponse.error);
  }

  const tokenRefresh = parsedResponse.data.tokenRefresh;

  if (
    !tokenRefresh ||
    tokenRefresh.errors.length > 0 ||
    !tokenRefresh.token ||
    !tokenRefresh.user
  ) {
    return {
      status: "error" as const,
      error: getCustomerSessionExpiredError(),
    };
  }

  return {
    status: "success" as const,
    session: {
      email: tokenRefresh.user.email,
      token: tokenRefresh.token,
      refreshToken,
      userId: tokenRefresh.user.id,
    },
  };
};

const requestWithCustomerToken = ({
  envUrl,
  document,
  variables,
  token,
}: {
  envUrl: string;
  document: RequestDocument;
  variables: Variables;
  token: string;
}) =>
  request<unknown, Variables>({
    url: envUrl,
    document,
    variables,
    requestHeaders: {
      ...saleorRequestHeaders,
      Authorization: `Bearer ${token}`,
    },
  });

export const requestWithCustomerTokenRefresh = async ({
  envUrl,
  document,
  variables,
  customerSession,
}: {
  envUrl: string;
  document: RequestDocument;
  variables: Variables;
  customerSession: z.infer<typeof customerSessionInputSchema>;
}) => {
  try {
    return {
      status: "success" as const,
      response: await requestWithCustomerToken({
        envUrl,
        document,
        variables,
        token: customerSession.token,
      }),
      refreshedSession: null,
    };
  } catch (error) {
    if (!isCustomerTokenExpiredError(error)) {
      throw BaseError.normalize(error, UnknownError);
    }
  }

  const refreshResult = await refreshCustomerToken({
    envUrl,
    refreshToken: customerSession.refreshToken,
  });

  if (refreshResult.status === "error") {
    return {
      status: "error" as const,
      error: refreshResult.error,
      refreshedSession: null,
    };
  }

  return {
    status: "success" as const,
    response: await requestWithCustomerToken({
      envUrl,
      document,
      variables,
      token: refreshResult.session.token,
    }).catch((error) => {
      throw BaseError.normalize(error, UnknownError);
    }),
    refreshedSession: refreshResult.session,
  };
};
