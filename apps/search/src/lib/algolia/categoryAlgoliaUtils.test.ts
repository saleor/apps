import { describe, expect, it } from "vitest";

import { type CategoryDataFragment } from "../../../generated/graphql";
import { categoryToAlgolia, categoryToAlgoliaIndexId } from "./categoryAlgoliaUtils";

const createCategory = (overrides: Partial<CategoryDataFragment> = {}): CategoryDataFragment => ({
  id: "cat-1",
  name: "Shoes",
  slug: "shoes",
  level: 0,
  metadata: [],
  ...overrides,
});

describe("categoryAlgoliaUtils", () => {
  describe("categoryToAlgoliaIndexId", () => {
    it("Creates index name with prefix", () => {
      expect(categoryToAlgoliaIndexId("staging")).toBe("staging.categories");
    });

    it("Creates index name without prefix when undefined", () => {
      expect(categoryToAlgoliaIndexId(undefined)).toBe("categories");
    });

    it("Creates index name without prefix when empty string", () => {
      expect(categoryToAlgoliaIndexId("")).toBe("categories");
    });
  });

  describe("categoryToAlgolia", () => {
    it("Maps category to Algolia object with all fields", () => {
      const category = createCategory({
        id: "cat-123",
        name: "Shoes",
        slug: "shoes",
        level: 1,
        ancestors: {
          edges: [{ node: { id: "cat-root", name: "Clothing", slug: "clothing" } }],
        },
        metadata: [{ key: "priority", value: "high" }],
      });

      const result = categoryToAlgolia(category);

      expect(result.objectID).toBe("cat-123");
      expect(result.name).toBe("Shoes");
      expect(result.slug).toBe("shoes");
      expect(result.level).toBe(1);
      expect(result._type).toBe("category");
      expect(result.ancestors).toStrictEqual([
        { id: "cat-root", name: "Clothing", slug: "clothing" },
      ]);
      expect(result.metadata).toStrictEqual({ priority: "high" });
    });

    it("Maps ancestors with multiple levels", () => {
      const category = createCategory({
        name: "Trail Running",
        level: 3,
        ancestors: {
          edges: [
            { node: { id: "a1", name: "Apparel", slug: "apparel" } },
            { node: { id: "a2", name: "Footwear", slug: "footwear" } },
            { node: { id: "a3", name: "Running", slug: "running" } },
          ],
        },
      });

      const result = categoryToAlgolia(category);

      expect(result.ancestors).toStrictEqual([
        { id: "a1", name: "Apparel", slug: "apparel" },
        { id: "a2", name: "Footwear", slug: "footwear" },
        { id: "a3", name: "Running", slug: "running" },
      ]);
    });

    it("Returns empty ancestors when no ancestors field", () => {
      const category = createCategory({ ancestors: undefined });

      const result = categoryToAlgolia(category);

      expect(result.ancestors).toStrictEqual([]);
    });

    it("Sets _type to category", () => {
      const result = categoryToAlgolia(createCategory());

      expect(result._type).toBe("category");
    });
  });
});
