import { SaleorApiUrl } from "@/modules/saleor/saleor-api-url";

export const mockedSaleorApiUrl = SaleorApiUrl.create({
  url: "https://foo.bar.saleor.cloud/graphql/",
})._unsafeUnwrap();
