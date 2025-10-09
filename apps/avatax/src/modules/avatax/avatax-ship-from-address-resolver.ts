import { AddressLocationInfo as AvataxAddress } from "avatax/lib/models/AddressLocationInfo";

import { createLogger } from "../../logger";
import { avataxAddressFactory } from "./address-factory";
import { AvataxConfig } from "./avatax-connection-schema";

const logger = createLogger("avataxShipFromAddress");

type NullableString = string | null | undefined;

interface ShipFromAddressInput {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

function parseShipFromAddressMetadata(metadata: string): ShipFromAddressInput | null {
  try {
    const parsed: unknown = JSON.parse(metadata);

    // Type guard and validation
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      !("street" in parsed) ||
      !("city" in parsed) ||
      !("state" in parsed) ||
      !("zip" in parsed) ||
      !("country" in parsed)
    ) {
      logger.warn("Invalid shipFrom address metadata: missing required fields");

      return null;
    }

    const typedParsed = parsed as Record<string, unknown>;

    return {
      street: String(typedParsed.street),
      city: String(typedParsed.city),
      state: String(typedParsed.state),
      zip: String(typedParsed.zip),
      country: String(typedParsed.country),
    };
  } catch (error) {
    logger.warn("Failed to parse shipFrom address metadata", {
      errorMessage: error instanceof Error ? error.message : String(error),
      metadataLength: metadata.length,
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
