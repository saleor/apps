import { EditorJsPlaintextRenderer } from "@saleor/apps-shared/editor-js-plaintext-renderer";

interface GetDescriptionAttributeValueArgs {
  description?: string | null;
  seoDescription?: string | null;
}

/*
 * Returns value for the "g:description" attribute.
 * Prefers the product's SEO description (plain text) when available,
 * otherwise falls back to the rich-text description rendered to plain text.
 *
 * Google Docs specification: https://support.google.com/merchants/answer/6324468?hl=en
 */
export const getDescriptionAttributeValue = ({
  description,
  seoDescription,
}: GetDescriptionAttributeValueArgs) => {
  if (seoDescription?.length) {
    return seoDescription;
  }

  return EditorJsPlaintextRenderer({ stringData: description ?? "" });
};
