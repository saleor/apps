/**
 * Repo-specific oxlint rules, loaded as a JS plugin from the root .oxlintrc.json. oxlint runs this
 * file directly with Node's type stripping, so it stays a single file with type-only imports.
 */
import type { RuleTester } from "oxlint/plugins-dev";

type Rule = Parameters<RuleTester["run"]>[1];

const graphqlTags = new Set(["gql", "graphql"]);

/**
 * GraphQL documents belong in .graphql files. Inline gql`...` documents are missed by
 * lint:graphql (deprecated fields, naming) and force codegen to scan TypeScript, so every TS edit
 * reruns it. gql.tada's graphql(`...`) calls are not tagged templates and pass.
 */
export const noInlineGraphql = {
  meta: {
    type: "suggestion",
    docs: { description: "Disallow GraphQL documents written inline in TypeScript" },
    messages: {
      inline:
        "Move this GraphQL document to a .graphql file under graphql/ and import the generated *Document from @/generated/graphql.",
    },
  },
  create(context) {
    return {
      TaggedTemplateExpression(node) {
        if (node.tag.type === "Identifier" && graphqlTags.has(node.tag.name)) {
          context.report({ node, messageId: "inline" });
        }
      },
    };
  },
} satisfies Rule;

// oxlint-disable-next-line import/no-default-export -- oxlint loads JS plugins through their default export
export default {
  meta: { name: "saleor" },
  rules: { "no-inline-graphql": noInlineGraphql },
};
