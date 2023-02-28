import { ImageProps } from "next/image";
import { TaxProviderName } from ".";
import { AvataxIcon, TaxJarIcon } from "../../../assets";

export const providerConfig: Record<TaxProviderName, { label: string; icon: ImageProps["src"] }> = {
  taxjar: {
    label: "TaxJar",
    icon: TaxJarIcon,
  },
  avatax: {
    label: "Avalara",
    icon: AvataxIcon,
  },
};
