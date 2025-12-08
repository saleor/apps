import { Oaza } from "jp-zipcode-lookup";

export class JapanesePostalData {
  getNeighbourhood(postalCode: string) {
    const hoods = Oaza.byZipcode(postalCode);

    return hoods[0];
  }
}
