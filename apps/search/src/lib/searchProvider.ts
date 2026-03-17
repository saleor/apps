import {
  type CategoryDataFragment,
  type PageDataFragment,
  type ProductVariantWebhookPayloadFragment,
  type ProductWebhookPayloadFragment,
} from "../../generated/graphql";

export interface SearchProvider {
  createProduct(product: ProductWebhookPayloadFragment): Promise<void>;
  updateProduct(product: ProductWebhookPayloadFragment): Promise<void>;
  deleteProduct(productId: Pick<ProductWebhookPayloadFragment, "id">): Promise<void>;
  createProductVariant(productVariant: ProductVariantWebhookPayloadFragment): Promise<void>;
  updateProductVariant(productVariant: ProductVariantWebhookPayloadFragment): Promise<void>;
  deleteProductVariant(productId: { id: string; product: { id: string } }): Promise<void>;
  createCategory(category: CategoryDataFragment): Promise<void>;
  updateCategory(category: CategoryDataFragment): Promise<void>;
  deleteCategory(categoryId: string): Promise<void>;
  createPage(page: PageDataFragment): Promise<void>;
  updatePage(page: PageDataFragment): Promise<void>;
  deletePage(pageId: string): Promise<void>;
}
