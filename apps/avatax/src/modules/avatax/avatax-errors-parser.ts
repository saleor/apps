import { captureException } from "@sentry/nextjs";
import { z } from "zod";

import { BaseError } from "../../error";
import {
  AvataxEntityNotFoundError,
  AvataxForbiddenAccessError,
  AvataxGetTaxSystemError,
  AvataxGetTaxWrongInputError,
  AvataxInvalidAddressError,
  AvataxInvalidCredentialsError,
  AvataxStringLengthError,
  AvataxTransactionAlreadyCancelledError,
} from "../taxes/tax-error";
import { assertUnreachableWithoutThrow } from "../utils/assert-unreachable";
import { normalizeAvaTaxError } from "./avatax-error-normalizer";

export class AvataxErrorsParser {
  static UnhandledErrorShapeError = BaseError.subclass("UnhandledErrorShapeError");

  /**
   * User input fault codes that should return HTTP 400 - errors caused by invalid user data
   * Reference: https://developer.avalara.com/avatax/common-errors/
   */
  private static userInputFaultCodes = [
    "InvalidZipForStateError", // Zip not valid for the provided state
    "ZipNotValidError", // Zip not valid for the provided state
    "AddressRangeError", // The address number is out of range
    "InvalidAddress", // Address is incomplete or invalid
    "InsufficientAddressError", // Insufficient address information
    "PostalCodeError", // Invalid ZIP/Postal Code
    "AddressError", // Unable to validate the address
    "CountryError", // Unknown country name or code
    "DateRangeError", // Start Date cannot be later than the End Date.
    "RegionCodeError", // Invalid or missing state/province code.
  ] as const;

  private static userInputFaultCodesSet = new Set(AvataxErrorsParser.userInputFaultCodes);

  /**
   * System fault codes that should return HTTP 500 - errors caused by system/app configuration issues
   * Reference: https://developer.avalara.com/avatax/common-errors/
   */
  private static systemFaultCodes = [
    "CompanyNotFoundError", // Company not found.
    "DocStatusError", // DocStatus is invalid for this operation.
    "DocTypeError", // DocType is invalid.
    "DocumentNotFoundError", // The tax document could not be found.
    "TaxAddressError", // Address (origin or destination) is incomplete or invalid.
    "JurisdictionNotFoundError", // Unable to determine the taxing jurisdictions.
    "InactiveCompanyError", // Tax operations not allowed for an inactive company.
    "DuplicateLineNoError", // Duplicate line number.
    "TaxRegionError", // The TaxRegionId was not found.
    "TaxOverrideError", // Tax override cannot be applied.
    "UnsupportedCountryError", // Country not supported.
  ] as const;

  private static faultSubCodeSchema = z.enum([
    ...AvataxErrorsParser.userInputFaultCodes,
    ...AvataxErrorsParser.systemFaultCodes,
  ]);

  private static schema = z
    .object({
      // https://developer.avalara.com/avatax/errors/
      code: z.enum([
        "InvalidAddress",
        "GetTaxError",
        "AuthenticationException",
        "StringLengthError",
        "EntityNotFoundError",
        "TransactionAlreadyCancelled",
        "PermissionRequired",
      ]),
      details: z.array(
        z.object({
          faultSubCode: z.string().optional(),
          description: z.string().optional(),
          helpLink: z.string().optional(),
          message: z.string().optional(),
        }),
      ),
    })
    .superRefine((data, ctx) => {
      // For GetTaxError, validate faultSubCode against known enum values
      if (data.code === "GetTaxError") {
        data.details.forEach((detail, index) => {
          if (detail.faultSubCode) {
            const result = AvataxErrorsParser.faultSubCodeSchema.safeParse(detail.faultSubCode);

            if (!result.success) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["details", index, "faultSubCode"],
                message: `Unknown faultSubCode for GetTaxError: ${detail.faultSubCode}`,
              });
            }
          }
        });
      }
    });

  parse(err: unknown, injectedErrorCapture = captureException) {
    const parsedError = AvataxErrorsParser.schema.safeParse(err);

    if (!parsedError.success) {
      injectedErrorCapture(
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
        // Parse faultSubCode from details to determine if this is a user input error or system error
        const firstDetail = parsedError.data.details[0];
        const faultSubCode = firstDetail?.faultSubCode;
        const description = firstDetail?.description || "";
        const message = firstDetail?.message || "";

        if (faultSubCode && AvataxErrorsParser.userInputFaultCodesSet.has(faultSubCode)) {
          // User input error - return HTTP 400
          return new AvataxGetTaxWrongInputError(parsedError.data.code, {
            props: {
              faultSubCode,
              description,
              message,
            },
          });
        } else {
          // System/app error - return HTTP 500
          return new AvataxGetTaxSystemError(parsedError.data.code, {
            props: {
              faultSubCode: faultSubCode || "Unknown",
              description,
              message,
            },
          });
        }
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

      case "EntityNotFoundError": {
        return new AvataxEntityNotFoundError(parsedError.data.code, {
          props: {
            description: parsedError.data.details[0].description,
          },
        });
      }

      case "TransactionAlreadyCancelled": {
        return new AvataxTransactionAlreadyCancelledError(parsedError.data.code, {
          props: {
            description: parsedError.data.details[0].description,
          },
        });
      }

      case "PermissionRequired": {
        return new AvataxForbiddenAccessError(parsedError.data.code, {
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
