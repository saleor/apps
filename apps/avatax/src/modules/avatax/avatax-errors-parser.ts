import { z } from "zod";
import { BaseError } from "../../error";
import {
  AvataxGetTaxError,
  AvataxInvalidAddressError,
  AvataxInvalidCredentialsError,
  AvataxStringLengthError,
} from "../taxes/tax-error";
import { assertUnreachableWithoutThrow } from "../utils/assert-unreachable";
import { normalizeAvaTaxError } from "./avatax-error-normalizer";

export class AvataxErrorsParser {
  static UnhandledErrorShapeError = BaseError.subclass("UnhandledErrorShapeError");

  constructor(
    private injectedErrorCapture: (
      exception: InstanceType<typeof AvataxErrorsParser.UnhandledErrorShapeError>,
    ) => void,
  ) {}

  private static schema = z.object({
    // https://developer.avalara.com/avatax/errors/
    code: z.enum(["InvalidAddress", "GetTaxError", "AuthenticationException", "StringLengthError"]),
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
      this.injectedErrorCapture(
        new AvataxErrorsParser.UnhandledErrorShapeError(
          "AvaTax returned error with unknown shape",
          {
            errors: [parsedError.error],
          },
        ),
      );

      return normalizeAvaTaxError(err);
    }

    switch (parsedError.data.code) {
      case "InvalidAddress": {
        return AvataxInvalidAddressError.normalize(parsedError);
      }
      case "GetTaxError": {
        return AvataxGetTaxError.normalize(parsedError);
      }
      case "AuthenticationException": {
        return AvataxInvalidCredentialsError.normalize(parsedError);
      }
      case "StringLengthError": {
        return new AvataxStringLengthError(parsedError.data.code, {
          props: {
            description: parsedError.data.details[0].description,
          },
        });
      }
      default: {
        assertUnreachableWithoutThrow(parsedError.data.code);
        return normalizeAvaTaxError(err);
      }
    }
  }
}
