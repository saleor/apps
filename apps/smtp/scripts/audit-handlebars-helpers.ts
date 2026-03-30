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

interface ExtractResult {
  helpers: Set<string>;
  parseError: string | null;
}

function extractHelpers(template: string): ExtractResult {
  const helpers = new Set<string>();

  let ast: ASTNode;

  try {
    ast = Handlebars.parse(template);
  } catch (e) {
    return {
      helpers,
      parseError: e instanceof Error ? e.message : String(e),
    };
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
          const hasParams = node.params?.length > 0;
          const hasHash = node.hash?.pairs?.length > 0;

          if ((hasParams || hasHash) && !BUILTIN_HELPERS.has(name)) {
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
  return { helpers, parseError: null };
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
  const parseErrors: { saleorApiUrl: string; eventType: string; field: string; error: string }[] =
    [];
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

    const templateResult = extractHelpers(line.template);

    if (templateResult.parseError) {
      parseErrors.push({
        saleorApiUrl: key,
        eventType: line.eventType ?? "unknown",
        field: "template",
        error: templateResult.parseError,
      });
    }

    for (const h of templateResult.helpers) {
      customerHelpers.add(h);
    }

    const subjectResult = extractHelpers(line.subject);

    if (subjectResult.parseError) {
      parseErrors.push({
        saleorApiUrl: key,
        eventType: line.eventType ?? "unknown",
        field: "subject",
        error: subjectResult.parseError,
      });
    }

    for (const h of subjectResult.helpers) {
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

  if (parseErrors.length > 0) {
    console.log("\n" + "=".repeat(80));
    console.log("PARSE ERRORS");
    console.log("=".repeat(80));

    for (const pe of parseErrors) {
      console.log(`${pe.saleorApiUrl} [${pe.eventType}] ${pe.field}: ${pe.error}`);
    }
  }

  console.log("\n" + "=".repeat(80));
  console.log("SUMMARY");
  console.log("=".repeat(80));
  console.log(`Templates processed: ${lineCount}`);
  console.log(`Parse errors: ${parseErrors.length}`);
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
