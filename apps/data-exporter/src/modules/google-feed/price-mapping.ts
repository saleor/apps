import { GoogleFeedProductVariantFragment } from "../../../generated/graphql";

/**
 * Price format has to be altered from the en format to the one expected by Google
 * eg. 1.00 USD, 5.00 PLN
 */
const formatCurrency = (currency: string, amount: number) => {
  return (
    new Intl.NumberFormat("en-EN", {
      useGrouping: false,
      minimumFractionDigits: 2,
      style: "decimal",
      currencyDisplay: "code",
      currency: currency,
    }).format(amount) + ` ${currency}`
  );
};

interface priceMappingArgs {
  pricing: GoogleFeedProductVariantFragment["pricing"];
}

/*
 * Maps variant pricing to Google Feed format.
 * https://support.google.com/merchants/answer/6324371
 */
export const priceMapping = ({ pricing }: priceMappingArgs) => {
  const priceUndiscounted = pricing?.priceUndiscounted?.gross;

  // Pricing should not be submitted empty or with 0 value
  if (!priceUndiscounted?.amount) {
    return;
  }

  // Price attribute is expected to be a base price
  const formattedUndiscountedPrice = formatCurrency(
    priceUndiscounted.currency,
    priceUndiscounted.amount
  );

  const discountedPrice = pricing?.price?.gross;

  // Return early if there is no sale
  if (!discountedPrice || discountedPrice?.amount === priceUndiscounted.amount) {
    return {
      price: formattedUndiscountedPrice,
    };
  }

  const formattedDiscountedPrice = formatCurrency(discountedPrice.currency, discountedPrice.amount);

  return {
    price: formattedUndiscountedPrice,
    salePrice: formattedDiscountedPrice,
  };
};
