/* eslint-disable no-console */
/**
 * Reads JSONL output from dump-templates and reports unique Handlebars helpers per customer.
 *
 * Run: pnpm audit-helpers < templates.jsonl
 *   or: cat templates.jsonl | pnpm audit-helpers
 *
 * Input: one JSON object per line with at least { saleorApiUrl, template, subject }
 * No env vars or credentials required.
 */
import { createInterface } from "node:readline";

import Handlebars from "handlebars";

const BUILTIN_HELPERS = new Set([
  "if",
  "unless",
  "each",
  "with",
  "lookup",
  "log",
  "blockHelperMissing",
  "helperMissing",
]);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ASTNode = any;

function extractHelpers(template: string): Set<string> {
  const helpers = new Set<string>();

  let ast: ASTNode;

  try {
    ast = Handlebars.parse(template);
  } catch {
    return helpers;
  }

  function visit(node: ASTNode): void {
    if (!node) return;

    switch (node.type) {
      case "Program":
        node.body?.forEach((child: ASTNode) => visit(child));
        break;

      case "MustacheStatement": {
        const path = node.path;

        if (path?.type === "PathExpression") {
          const name: string = path.original;

          if (node.params?.length > 0 && !BUILTIN_HELPERS.has(name)) {
            helpers.add(name);
          }
        }
        node.params?.forEach((p: ASTNode) => visit(p));
        break;
      }

      case "BlockStatement": {
        const path = node.path;

        if (path?.type === "PathExpression") {
          const name: string = path.original;

          if (!BUILTIN_HELPERS.has(name)) {
            helpers.add(name);
          }
        }
        node.params?.forEach((p: ASTNode) => visit(p));
        if (node.program) visit(node.program);
        if (node.inverse) visit(node.inverse);
        break;
      }

      case "SubExpression": {
        const path = node.path;

        if (path?.type === "PathExpression") {
          const name: string = path.original;

          if (!BUILTIN_HELPERS.has(name)) {
            helpers.add(name);
          }
        }
        node.params?.forEach((p: ASTNode) => visit(p));
        break;
      }

      default:
        break;
    }
  }

  visit(ast);
  return helpers;
}

interface TemplateLine {
  saleorApiUrl: string;
  appId?: string;
  configId?: string;
  configName?: string;
  eventType?: string;
  template: string;
  subject: string;
}

async function main() {
  const rl = createInterface({ input: process.stdin });

  // saleorApiUrl -> Set<helper>
  const helpersByCustomer = new Map<string, Set<string>>();
  let lineCount = 0;

  for await (const raw of rl) {
    const trimmed = raw.trim();

    if (!trimmed) continue;

    let line: TemplateLine;

    try {
      line = JSON.parse(trimmed);
    } catch {
      console.error(`Skipping unparseable line: ${trimmed.slice(0, 80)}`);
      continue;
    }

    lineCount++;

    const key = line.saleorApiUrl;

    if (!helpersByCustomer.has(key)) {
      helpersByCustomer.set(key, new Set());
    }

    const customerHelpers = helpersByCustomer.get(key)!;

    for (const h of extractHelpers(line.template)) {
      customerHelpers.add(h);
    }
    for (const h of extractHelpers(line.subject)) {
      customerHelpers.add(h);
    }
  }

  // Output
  console.log("=".repeat(80));
  console.log("HANDLEBARS HELPERS AUDIT");
  console.log("=".repeat(80));

  const allUniqueHelpers = new Set<string>();
  let customersWithHelpers = 0;

  for (const [saleorApiUrl, helpers] of [...helpersByCustomer.entries()].sort(([a], [b]) =>
    a.localeCompare(b),
  )) {
    const sorted = [...helpers].sort();

    if (sorted.length > 0) {
      customersWithHelpers++;
      console.log(`${saleorApiUrl}: ${sorted.join(", ")}`);
      sorted.forEach((h) => allUniqueHelpers.add(h));
    } else {
      console.log(`${saleorApiUrl}: (none)`);
    }
  }

  console.log("\n" + "=".repeat(80));
  console.log("SUMMARY");
  console.log("=".repeat(80));
  console.log(`Templates processed: ${lineCount}`);
  console.log(`Customers: ${helpersByCustomer.size}`);
  console.log(`Customers using custom helpers: ${customersWithHelpers}`);
  console.log(
    `All unique helpers: ${
      allUniqueHelpers.size > 0 ? [...allUniqueHelpers].sort().join(", ") : "(none)"
    }`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
