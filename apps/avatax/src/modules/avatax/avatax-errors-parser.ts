import * as Sentry from "@sentry/nextjs";
import { z } from "zod";
import { InvalidAppAddressError } from "../taxes/tax-error";
import { normalizeAvaTaxError } from "./avatax-error-normalizer";

export class AvataxErrorsParser {
  private static schema = z.object({
    // https://developer.avalara.com/avatax/errors/
    code: z.enum(["InvalidAddress"]),
    details: z.array(
      z.object({
        faultSubCode: z.string().optional(),
        description: z.string().optional(),
        helpLink: z.string().optional(),
        message: z.string().optional(),
      }),
    ),
  });

  parse(err: unknown) {
    const parsedError = AvataxErrorsParser.schema.safeParse(err);

    if (!parsedError.success) {
      Sentry.addBreadcrumb({
        level: "error",
        data: err as Error,
      });
      Sentry.captureException("Avatax returned error with unknown shape");

      return normalizeAvaTaxError(err);
    }

    switch (parsedError.data.code) {
      case "InvalidAddress": {
        return InvalidAppAddressError.normalize(parsedError);
      }
      default:
        return normalizeAvaTaxError(parsedError);
    }
  }
}
