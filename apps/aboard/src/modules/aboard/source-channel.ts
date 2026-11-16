import { hash } from "./hash";

type SourceChannelInput = {
  name: string;
  slug: string;
  sourceName: string;
  sourceInstanceId: string;
  currencyCode: string;
};

export const sourceChannel = ({
  name,
  slug,
  sourceName,
  sourceInstanceId,
  currencyCode,
}: SourceChannelInput) => {
  const sourceHash = hash(sourceInstanceId).slice(0, 10);

  return {
    name: `${name}: ${sourceName} (${currencyCode})`,
    slug: `${slug}-${currencyCode.toLowerCase()}-${sourceHash}`,
    currencyCode,
  };
};
