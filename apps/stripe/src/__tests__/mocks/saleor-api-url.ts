import { createSaleorApiUrl } from "@/modules/saleor/saleor-api-url";

export const mockedSaleorApiUrl = createSaleorApiUrl(
  "https://foo.bar.saleor.cloud/graphql/",
)._unsafeUnwrap();
