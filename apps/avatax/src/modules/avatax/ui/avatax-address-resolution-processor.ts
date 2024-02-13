import { AddressResolutionModel } from "avatax/lib/models/AddressResolutionModel";
import { AddressSuggestions } from "./avatax-configuration-address-fragment";

export class AvataxAddressResolutionProcessor {
  extractSuggestionsFromResponse(response: AddressResolutionModel): AddressSuggestions {
    const address = response.validatedAddresses?.[0];

    if (!address) {
      throw new Error("No address found");
    }

    const lines = [address.line1, address.line2, address.line3].filter(Boolean);
    const street = lines.join(" ");

    return {
      street,
      city: address.city ?? "",
      state: address.region ?? "",
      country: address.country ?? "",
      zip: address.postalCode ?? "",
    };
  }

  resolveAddressResolutionMessage(response: AddressResolutionModel): {
    type: "success" | "info";
    message: string;
  } {
    if (!response.messages) {
      // When address was resolved completely, it has no messages.
      return {
        type: "success",
        message: "The address was resolved successfully.",
      };
    }

    const message = response.messages?.[0];

    return {
      type: "info",
      message: message?.summary ?? "The address was not resolved completely.",
    };
  }
}
