import { EditorJsPlaintextRenderer } from "@saleor/apps-shared/editor-js-plaintext-renderer";

import { type PageDataFragment } from "../../../generated/graphql";
import { safeParseJson } from "../safe-parse-json";
import { mapSelectedAttributesToRecord } from "./algoliaUtils";
import { metadataToAlgoliaAttribute } from "./metadata-to-algolia-attribute";

export function pageToAlgoliaIndexId(indexNamePrefix: string | undefined) {
  const normalizedPrefix = indexNamePrefix === "" ? undefined : indexNamePrefix;
  const nameSegments = [normalizedPrefix, "pages"];

  return nameSegments.filter((s) => s != null).join(".");
}

export type AlgoliaPageObject = ReturnType<typeof pageToAlgolia>;

export function pageToAlgolia(page: PageDataFragment, enabledKeys: string[]) {
  const attributes = page.attributes.reduce(
    (acc, attr) => {
      const preparedAttr = mapSelectedAttributesToRecord(attr);

      if (!preparedAttr) {
        return acc;
      }

      return {
        ...acc,
        ...preparedAttr,
      };
    },
    {} as Record<string, string | boolean | string[]>,
  );

  const document: Record<string, unknown> = {
    objectID: page.id,
    title: page.title,
    slug: page.slug,
    pageTypeId: page.pageType.id,
    seoTitle: page.seoTitle ?? null,
    _type: "page" as const,
  };

  if (enabledKeys.includes("content")) {
    document.content = safeParseJson(page.content);
  }

  if (enabledKeys.includes("contentPlaintext")) {
    document.contentPlaintext = EditorJsPlaintextRenderer({ stringData: page.content ?? "" });
  }

  if (enabledKeys.includes("seoDescription")) {
    document.seoDescription = page.seoDescription ?? null;
  }

  if (enabledKeys.includes("metadata")) {
    document.metadata = metadataToAlgoliaAttribute(page.metadata);
  }

  if (enabledKeys.includes("attributes")) {
    document.attributes = attributes;
  }

  return document;
}
