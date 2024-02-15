import { AddressesModel } from "avatax/lib/models/AddressesModel";
import { AddressFragment } from "../../../../generated/graphql";
import { taxProviderUtils } from "../../taxes/tax-provider-utils";
import { avataxAddressFactory } from "../address-factory";
import { AvataxConfig } from "../avatax-connection-schema";
import { CriticalError } from "../../../error";

export function resolveAvataxAddress({
  from,
  to,
}: {
  from: AvataxConfig["address"];
  to: AddressFragment | undefined | null;
}): AddressesModel {
  return {
    shipFrom: avataxAddressFactory.fromChannelAddress(from),
    shipTo: avataxAddressFactory.fromSaleorAddress(
      taxProviderUtils.resolveOptionalOrThrowUnexpectedError(
        to,
        new CriticalError("Missing shipTo address"),
      ),
    ),
  };
}
