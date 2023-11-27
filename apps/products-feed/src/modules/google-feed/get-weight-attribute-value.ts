import { Weight } from "../../../generated/graphql";

interface getWeightAttributeValueArgs {
  weight?: Weight;
  isShippingRequired: boolean;
}

/*
 * Returns value for the "g:shipping_weight" attribute.
 * When shipping is not required or weight is not provided, returns undefined.
 *
 * Google Docs specification: https://support.google.com/merchants/answer/6324503?hl=en
 */
export const getWeightAttributeValue = ({
  weight,
  isShippingRequired,
}: getWeightAttributeValueArgs) => {
  if (!isShippingRequired || !weight) {
    return undefined;
  }

  return `${weight.value} ${weight.unit.toLowerCase() || "kg"}`;
};
