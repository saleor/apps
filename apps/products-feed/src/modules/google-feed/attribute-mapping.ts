import { GoogleFeedProductVariantFragment } from "../../../generated/graphql";
import { RootConfig } from "../app-configuration/app-config";

interface GetMappedAttributesArgs {
  variant: GoogleFeedProductVariantFragment;
  attributeMapping?: RootConfig["attributeMapping"];
}

export const attributeArrayToValueString = (
  attributes?: GoogleFeedProductVariantFragment["attributes"],
) => {
  if (!attributes?.length) {
    return;
  }

  return attributes
    .map((a) => a.values)
    .flat() // Multiple values can be assigned to the attribute
    .map((v) => v.name) // get value to display
    .filter((v) => !!v) // filter out empty values
    .join("/"); // Format of multi value attribute recommended by Google
};

export const getMappedAttributes = ({
  variant,
  attributeMapping: mapping,
}: GetMappedAttributesArgs) => {
  /*
   * We have to take in account both product and variant attributes since we use flat
   * model in the feed
   */
  if (!mapping) {
    return;
  }
  const attributes = variant.attributes.concat(variant.product.attributes);

  const materialAttributes = attributes.filter((a) =>
    mapping.materialAttributeIds.includes(a.attribute.id),
  );
  const materialValue = attributeArrayToValueString(materialAttributes);

  const brandAttributes = attributes.filter((a) =>
    mapping.brandAttributeIds.includes(a.attribute.id),
  );
  const brandValue = attributeArrayToValueString(brandAttributes);

  const colorAttributes = attributes.filter((a) =>
    mapping.colorAttributeIds.includes(a.attribute.id),
  );
  const colorValue = attributeArrayToValueString(colorAttributes);

  const patternAttributes = attributes.filter((a) =>
    mapping.patternAttributeIds.includes(a.attribute.id),
  );
  const patternValue = attributeArrayToValueString(patternAttributes);

  const sizeAttributes = attributes.filter((a) =>
    mapping.sizeAttributeIds.includes(a.attribute.id),
  );
  const sizeValue = attributeArrayToValueString(sizeAttributes);

  const gtinAttributes = attributes.filter((a) =>
    mapping.gtinAttributeIds.includes(a.attribute.id),
  );
  const gtinValue = attributeArrayToValueString(gtinAttributes);

  return {
    material: materialValue,
    brand: brandValue,
    color: colorValue,
    size: sizeValue,
    pattern: patternValue,
    gtin: gtinValue,
  };
};
