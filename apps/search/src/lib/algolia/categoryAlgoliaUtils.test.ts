import { describe, expect, it } from "vitest";

import { type CategoryDataFragment } from "../../../generated/graphql";
import {
  buildCategoryHierarchy,
  categoryToAlgolia,
  categoryToAlgoliaIndexId,
} from "./categoryAlgoliaUtils";

const createCategory = (
  overrides: Partial<CategoryDataFragment> = {},
): CategoryDataFragment => ({
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

  describe("buildCategoryHierarchy", () => {
    it("Builds hierarchy for root category (no ancestors)", () => {
      const category = createCategory({ name: "Clothing" });

      const result = buildCategoryHierarchy(category);

      expect(result).toEqual({
        lvl0: "Clothing",
      });
    });

    it("Builds hierarchy with ancestors in correct order", () => {
      const category = createCategory({
        name: "Running Shoes",
        level: 2,
        ancestors: {
          edges: [
            { node: { id: "root", name: "Clothing", slug: "clothing" } },
            { node: { id: "mid", name: "Shoes", slug: "shoes" } },
          ],
        },
      });

      const result = buildCategoryHierarchy(category);

      expect(result).toEqual({
        lvl0: "Clothing",
        lvl1: "Clothing > Shoes",
        lvl2: "Clothing > Shoes > Running Shoes",
      });
    });

    it("Handles deeply nested ancestors", () => {
      const category = createCategory({
        name: "Trail Running",
        level: 4,
        ancestors: {
          edges: [
            { node: { id: "a1", name: "Apparel", slug: "apparel" } },
            { node: { id: "a2", name: "Footwear", slug: "footwear" } },
            { node: { id: "a3", name: "Running", slug: "running" } },
            { node: { id: "a4", name: "Outdoor", slug: "outdoor" } },
          ],
        },
      });

      const result = buildCategoryHierarchy(category);

      expect(result).toEqual({
        lvl0: "Apparel",
        lvl1: "Apparel > Footwear",
        lvl2: "Apparel > Footwear > Running",
        lvl3: "Apparel > Footwear > Running > Outdoor",
        lvl4: "Apparel > Footwear > Running > Outdoor > Trail Running",
      });
    });

    it("Handles category with no ancestors field", () => {
      const category = createCategory({ name: "Root", ancestors: undefined });

      const result = buildCategoryHierarchy(category);

      expect(result).toEqual({
        lvl0: "Root",
      });
    });
  });

  describe("categoryToAlgolia", () => {
    it("Maps category to Algolia object with all fields", () => {
      const category = createCategory({
        id: "cat-123",
        name: "Shoes",
        slug: "shoes",
        description: '{"blocks":[]}',
        seoTitle: "Buy Shoes",
        seoDescription: "Best shoes",
        level: 1,
        parent: { id: "cat-root" },
        ancestors: {
          edges: [{ node: { id: "cat-root", name: "Clothing", slug: "clothing" } }],
        },
        metadata: [{ key: "priority", value: "high" }],
      });

      const result = categoryToAlgolia(category);

      expect(result.objectID).toBe("cat-123");
      expect(result.name).toBe("Shoes");
      expect(result.slug).toBe("shoes");
      expect(result.seoTitle).toBe("Buy Shoes");
      expect(result.seoDescription).toBe("Best shoes");
      expect(result.level).toBe(1);
      expect(result.parentId).toBe("cat-root");
      expect(result._type).toBe("category");
      expect(result.hierarchy).toEqual({
        lvl0: "Clothing",
        lvl1: "Clothing > Shoes",
      });
      expect(result.metadata).toEqual({ priority: "high" });
    });

    it("Maps null optional fields correctly", () => {
      const category = createCategory({
        description: null,
        seoTitle: null,
        seoDescription: null,
        parent: null,
      });

      const result = categoryToAlgolia(category);

      expect(result.seoTitle).toBeNull();
      expect(result.seoDescription).toBeNull();
      expect(result.parentId).toBeNull();
      expect(result.description).toBeNull();
    });

    it("Sets _type to category", () => {
      const result = categoryToAlgolia(createCategory());

      expect(result._type).toBe("category");
    });
  });
});
