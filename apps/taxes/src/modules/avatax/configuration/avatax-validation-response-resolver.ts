import { AddressResolutionModel } from "avatax/lib/models/AddressResolutionModel";

export class AvataxValidationResponseResolver {
  resolve(response: AddressResolutionModel) {
    if (response.messages && response.messages.length > 0) {
      throw new Error(
        "The provided address is invalid. Please visit https://developer.avalara.com/avatax/address-validation/ to learn about address formatting."
      );
    }
  }
}
