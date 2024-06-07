import {
  ProductVariantWebhookPayloadFragment,
  ProductWebhookPayloadFragment,
} from "../../generated/graphql";

export interface SearchProvider {
  createProduct(product: ProductWebhookPayloadFragment): Promise<void>;
  updateProduct(product: ProductWebhookPayloadFragment): Promise<void>;
  deleteProduct(productId: ProductWebhookPayloadFragment): Promise<void>;
  createProductVariant(productVariant: ProductVariantWebhookPayloadFragment): Promise<void>;
  updateProductVariant(productVariant: ProductVariantWebhookPayloadFragment): Promise<void>;
  deleteProductVariant(productId: ProductVariantWebhookPayloadFragment): Promise<void>;
}
