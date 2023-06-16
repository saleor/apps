import { createId } from "../../../lib/utils";
import { TaxCode } from "../../tax-codes/tax-code-match-schema";
import { AvataxTaxCodeMatches } from "./avatax-tax-code-match-repository";

export class AvataxTaxCodeMapper {
  map(avataxTaxCodes: TaxCode[], savedMatches: AvataxTaxCodeMatches): AvataxTaxCodeMatches {
    const mappedTaxCodes = avataxTaxCodes.map((taxCode) => {
      const match = savedMatches.find((m) => m.data.avataxTaxCode.code === taxCode.code);

      if (match) {
        return match;
      }

      return {
        id: createId(),
        data: {
          saleorTaxClass: null,
          avataxTaxCode: {
            code: taxCode.code,
            name: taxCode.name,
          },
        },
      };
    });

    return mappedTaxCodes;
  }
}
