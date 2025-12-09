import { AddressFragment } from "@/generated/graphql";
import { JapanesePostalData } from "@/modules/atobarai/japanese-postal-data";

export class AtobaraiAddressFormatter {
  /**
   * We are using external library that is using japanese post official address data
   * to map provided City and Neighbourhood to the one from the external source.
   *
   * This mimics legacy Saleor plugin behavior.
   */
  private postalDataResolver = new JapanesePostalData();

  formatAddress = (address: AddressFragment): string => {
    const zip = address.postalCode;
    const postalDataFrom = this.postalDataResolver.getNeighbourhood(zip);

    const localCity = postalDataFrom?.city?.name;
    const localNeighbourhood = postalDataFrom?.name;

    return `${address.countryArea}${localCity ?? address.city}${
      localNeighbourhood ?? address.cityArea
    }${address.streetAddress1}${address.streetAddress2}`;
  };
}
