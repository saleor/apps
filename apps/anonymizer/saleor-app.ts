import { SaleorApp } from "@saleor/app-sdk/saleor-app";

import { NoopAPL } from "./src/lib/noop-apl";

/**
 * Anonymizer has no backend that needs to persist auth data, so it uses a
 * {@link NoopAPL} that stores nothing.
 *
 * To read more about storing auth data, read the
 * [APL documentation](https://docs.saleor.io/developer/extending/apps/developing-apps/app-sdk/apl)
 */
const apl = new NoopAPL();

export const saleorApp = new SaleorApp({
  apl,
});
