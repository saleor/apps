import { AddressLocationInfo as AvataxAddress } from "avatax/lib/models/AddressLocationInfo";
import { z } from "zod";

import { createLogger } from "../../logger";
import { avataxAddressFactory } from "./address-factory";
import { AvataxConfig } from "./avatax-connection-schema";

const logger = createLogger("avataxShipFromAddress");

type NullableString = string | null | undefined;

const shipFromAddressSchema = z.object({
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  zip: z.string().min(1),
  country: z.string().min(1),
});

type ShipFromAddressInput = z.infer<typeof shipFromAddressSchema>;

function parseShipFromAddressMetadata(metadata: string): ShipFromAddressInput | null {
  try {
    const parsed: unknown = JSON.parse(metadata);
    const result = shipFromAddressSchema.safeParse(parsed);

    if (!result.success) {
      logger.warn("Invalid shipFrom address metadata", {
        errors: result.error.errors.map((err) => ({
          path: err.path.join("."),
          message: err.message,
        })),
      });

      return null;
    }

    return result.data;
  } catch (error) {
    logger.warn("Failed to parse shipFrom address metadata", {
      errorMessage: error instanceof Error ? error.message : String(error),
      metadata,
    });

    return null;
  }
}

// see: https://docs.saleor.io/developer/app-store/apps/avatax/configuration#mapping-transaction-fields
export const avataxShipFromAddressResolver = {
  resolve({
    avataxShipFromAddress,
    fallbackAddress,
  }: {
    avataxShipFromAddress: NullableString;
    fallbackAddress: AvataxConfig["address"];
  }): AvataxAddress {
    if (avataxShipFromAddress) {
      const parsedAddress = parseShipFromAddressMetadata(avataxShipFromAddress);

      if (parsedAddress) {
        logger.debug("Successfully parsed shipFrom address from metadata", {
          street: parsedAddress.street,
          city: parsedAddress.city,
          state: parsedAddress.state,
          zip: parsedAddress.zip,
          country: parsedAddress.country,
        });

        return {
          line1: parsedAddress.street,
          city: parsedAddress.city,
          region: parsedAddress.state,
          postalCode: parsedAddress.zip,
          country: parsedAddress.country,
        };
      }
    }

    logger.debug("Using fallback shipFrom address from configuration.");

    return avataxAddressFactory.fromChannelAddress(fallbackAddress);
  },
};
