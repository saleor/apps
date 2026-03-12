import { type CategoryDataFragment } from "../../../generated/graphql";
import { metadataToAlgoliaAttribute } from "./metadata-to-algolia-attribute";

export function categoryToAlgoliaIndexId(indexNamePrefix: string | undefined) {
  const normalizedPrefix = indexNamePrefix === "" ? undefined : indexNamePrefix;
  const nameSegments = [normalizedPrefix, "categories"];

  return nameSegments.filter((s) => s != null).join(".");
}

export type AlgoliaCategoryObject = ReturnType<typeof categoryToAlgolia>;

export function categoryToAlgolia(category: CategoryDataFragment) {
  const ancestors =
    category.ancestors?.edges.map((edge) => ({
      id: edge.node.id,
      name: edge.node.name,
      slug: edge.node.slug,
    })) ?? [];

  return {
    objectID: category.id,
    name: category.name,
    slug: category.slug,
    level: category.level,
    ancestors,
    metadata: metadataToAlgoliaAttribute(category.metadata),
    _type: "category" as const,
  };
}
