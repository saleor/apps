import { RuleTester } from "oxlint/plugins-dev";
import { describe, it } from "vitest";

import { noInlineGraphql } from "./index";

RuleTester.describe = describe;
RuleTester.it = it;

new RuleTester().run("no-inline-graphql", noInlineGraphql, {
  valid: [
    'import { FetchShopDocument } from "@/generated/graphql";',
    "const query = graphql(`query Shop { shop { name } }`);",
    "const html = css`color: red;`;",
  ],
  invalid: [
    {
      code: "const query = gql`query Shop { shop { name } }`;",
      errors: [{ messageId: "inline" }],
    },
    {
      code: "const query = graphql`query Shop { shop { name } }`;",
      errors: [{ messageId: "inline" }],
    },
  ],
});
