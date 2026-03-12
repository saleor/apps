import { EditorJsPlaintextRenderer } from "@saleor/apps-shared/editor-js-plaintext-renderer";

import { type CategoryDataFragment } from "../../../generated/graphql";
import { isNotNil } from "../isNotNil";
import { safeParseJson } from "../safe-parse-json";
import { metadataToAlgoliaAttribute } from "./metadata-to-algolia-attribute";

export function categoryToAlgoliaIndexId(indexNamePrefix: string | undefined) {
  const normalizedPrefix = indexNamePrefix === "" ? undefined : indexNamePrefix;
  const nameSegments = [normalizedPrefix, "categories"];

  return nameSegments.filter(isNotNil).join(".");
}

/**
 * Builds hierarchical facet structure from the category's ancestors list.
 * Ancestors are returned from the API in root-first order.
 * The current category is appended as the last level.
 *
 * Example output for "Root > Sub > Current":
 * { lvl0: "Root", lvl1: "Root > Sub", lvl2: "Root > Sub > Current" }
 */
export function buildCategoryHierarchy(category: CategoryDataFragment) {
  const ancestorNames =
    category.ancestors?.edges.map((edge) => edge.node.name).filter((name) => name?.length) ?? [];

  const names = [...ancestorNames, category.name];

  const hierarchy: Record<string, string> = {};

  for (let i = 0; i < names.length; i += 1) {
    hierarchy[`lvl${i}`] = names.slice(0, i + 1).join(" > ");
  }

  return hierarchy;
}

export type AlgoliaCategoryObject = ReturnType<typeof categoryToAlgolia>;

export function categoryToAlgolia(category: CategoryDataFragment) {
  return {
    objectID: category.id,
    name: category.name,
    slug: category.slug,
    description: safeParseJson(category.description),
    descriptionPlaintext: EditorJsPlaintextRenderer({
      stringData: category.description ?? "",
    }),
    seoTitle: category.seoTitle ?? null,
    seoDescription: category.seoDescription ?? null,
    level: category.level,
    parentId: category.parent?.id ?? null,
    hierarchy: buildCategoryHierarchy(category),
    metadata: metadataToAlgoliaAttribute(category.metadata),
    _type: "category" as const,
  };
}
