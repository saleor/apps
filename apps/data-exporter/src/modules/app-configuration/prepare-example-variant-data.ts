import { getMappedAttributes } from "../google-feed/attribute-mapping";
import { RootConfig } from "./app-config";
import { exampleVariantData } from "./example-variant-data";

interface PrepareExampleVariantData {
  attributeMapping?: RootConfig["attributeMapping"];
}

export const prepareExampleVariantData = ({ attributeMapping }: PrepareExampleVariantData) => {
  const attributes = getMappedAttributes({
    attributeMapping: attributeMapping,
    variant: exampleVariantData,
  });

  return {
    variant: exampleVariantData,
    googleAttributes: attributes,
  };
};
