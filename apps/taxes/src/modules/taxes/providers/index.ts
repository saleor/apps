import { AvataxProvider } from "./avatax/avatax-provider";
import { TaxJarProvider } from "./taxjar/taxjar-provider";

const taxProviders = {
  taxjar: TaxJarProvider,
  avatax: AvataxProvider,
};

export type TaxProviderName = keyof typeof taxProviders;
export default taxProviders;
