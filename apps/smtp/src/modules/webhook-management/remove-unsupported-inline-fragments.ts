import { parse, print, visit } from "graphql";

/**
 * Subscription queries are generated against the newest supported Saleor schema, but webhooks are
 * registered against whatever version the merchant runs. `webhookCreate` rejects the whole query if
 * it mentions a type that doesn't exist there, so drop the inline fragments that the target Saleor
 * can't resolve before sending the mutation.
 */
export const removeUnsupportedInlineFragments = (query: string, unsupportedTypes: string[]) =>
  print(
    visit(parse(query), {
      InlineFragment: (node) =>
        node.typeCondition && unsupportedTypes.includes(node.typeCondition.name.value)
          ? null
          : undefined,
    }),
  );
