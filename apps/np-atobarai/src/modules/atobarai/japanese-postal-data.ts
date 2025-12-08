import { Oaza } from "jp-zipcode-lookup";

export class JapanesePostalData {
  getNeighbourhood(postalCode: string) {
    // Lib accepts postal code without dash, so clean it first
    const formattedCode = postalCode.replace("-", "");

    const hoods = Oaza.byZipcode(formattedCode);

    return hoods[0];
  }
}
