import { AvataxIcon, TaxJarIcon } from "../../assets";

export const providerConfig = {
  taxjar: {
    label: "TaxJar",
    icon: TaxJarIcon,
  },
  avatax: {
    label: "Avatax",
    icon: AvataxIcon,
  },
};

export type TaxProviderName = keyof typeof providerConfig;
