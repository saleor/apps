"use server";

import request from "graphql-request";
import { z } from "zod";

import { graphql } from "@/graphql/gql";
import { envUrlSchema } from "@/lib/env-url";
import { BaseError, UnknownError } from "@/lib/errors";
import { actionClient } from "@/lib/safe-action";
import { saleorRequestHeaders } from "@/lib/saleor-request-headers";
import { accountErrorSchema } from "@/modules/customer-session/actions/customer-token";

const LoginCustomerSchema = z.object({
  tokenCreate: z
    .object({
      token: z.string().nullable(),
      refreshToken: z.string().nullable(),
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

const LoginCustomerMutation = graphql(`
  mutation LoginSquareTestCustomer($email: String!, $password: String!) {
    tokenCreate(email: $email, password: $password) {
      token
      refreshToken
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

const LoginCustomerParsingResponseError = BaseError.subclass("LoginCustomerParsingResponseError");

const getLoginErrorResult = (error: z.infer<typeof accountErrorSchema> | undefined) => ({
  status: "error" as const,
  error: {
    code: error?.code,
    field: error?.field,
    message: error?.message ?? "Saleor could not log in the test customer.",
  },
});

export const loginCustomer = actionClient
  .schema(
    z.object({
      envUrl: envUrlSchema,
      email: z.string().email(),
      password: z.string().min(1),
    }),
  )
  .metadata({ actionName: "loginCustomer" })
  .action(async ({ parsedInput: { envUrl, email, password } }) => {
    const response = await request(
      envUrl,
      LoginCustomerMutation,
      {
        email,
        password,
      },
      saleorRequestHeaders,
    ).catch((error) => {
      throw BaseError.normalize(error, UnknownError);
    });

    const parsedResponse = LoginCustomerSchema.safeParse(response);

    if (parsedResponse.error) {
      throw LoginCustomerParsingResponseError.normalize(parsedResponse.error);
    }

    const tokenCreate = parsedResponse.data.tokenCreate;

    if (!tokenCreate) {
      return getLoginErrorResult(undefined);
    }

    if (tokenCreate.errors.length > 0) {
      return getLoginErrorResult(tokenCreate.errors[0]);
    }

    if (!tokenCreate.token || !tokenCreate.refreshToken || !tokenCreate.user) {
      return getLoginErrorResult(undefined);
    }

    return {
      status: "success" as const,
      session: {
        email: tokenCreate.user.email,
        token: tokenCreate.token,
        refreshToken: tokenCreate.refreshToken,
        userId: tokenCreate.user.id,
      },
    };
  });
