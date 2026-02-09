import type { Monaco } from "@monaco-editor/react";

/**
 * Recursively extract dot-notation paths from a JSON object.
 * Arrays produce an `#each` suggestion and recurse into the first element.
 */
export function extractPaths(obj: unknown, prefix = ""): { path: string; isArray: boolean }[] {
  if (obj === null || obj === undefined || typeof obj !== "object") {
    return [];
  }

  const results: { path: string; isArray: boolean }[] = [];

  for (const [key, value] of Object.entries(obj)) {
    const fullPath = prefix ? `${prefix}.${key}` : key;

    if (Array.isArray(value)) {
      results.push({ path: fullPath, isArray: true });

      // Recurse into first element for nested paths (e.g. order.lines[0].productName)
      if (value.length > 0 && typeof value[0] === "object" && value[0] !== null) {
        const nested = extractPaths(value[0], `this`);

        results.push(...nested);
      }
    } else if (typeof value === "object" && value !== null) {
      results.push({ path: fullPath, isArray: false });

      const nested = extractPaths(value, fullPath);

      results.push(...nested);
    } else {
      results.push({ path: fullPath, isArray: false });
    }
  }

  return results;
}

/** Handlebars block helpers to suggest. insertText omits leading `{{` since the user already typed it. */
const HANDLEBARS_HELPERS = [
  {
    label: "{{#if}}",
    insertText: "#if ${1:condition}}}\n  $0\n{{/if}}",
    detail: "Handlebars conditional block",
  },
  {
    label: "{{#each}}",
    insertText: "#each ${1:array}}}\n  $0\n{{/each}}",
    detail: "Handlebars iteration block",
  },
  {
    label: "{{#unless}}",
    insertText: "#unless ${1:condition}}}\n  $0\n{{/unless}}",
    detail: "Handlebars unless block",
  },
  {
    label: "{{else}}",
    insertText: "else}}",
    detail: "Handlebars else clause",
  },
];

/** Common MJML tags with snippets */
const MJML_TAGS = [
  {
    label: "mj-section",
    insertText: '<mj-section padding="${1:0}">\n  $0\n</mj-section>',
    detail: "MJML section container",
  },
  {
    label: "mj-column",
    insertText: "<mj-column>\n  $0\n</mj-column>",
    detail: "MJML column container",
  },
  {
    label: "mj-text",
    insertText: '<mj-text font-size="${1:16px}" color="${2:#334155}" padding="${3:0}">$0</mj-text>',
    detail: "MJML text element",
  },
  {
    label: "mj-button",
    insertText: '<mj-button href="${1:url}">$0</mj-button>',
    detail: "MJML button element",
  },
  {
    label: "mj-image",
    insertText:
      '<mj-image src="${1:url}" alt="${2:description}" width="${3:200px}" padding="${4:0}" />',
    detail: "MJML image element",
  },
  {
    label: "mj-divider",
    insertText:
      '<mj-divider border-color="${1:#e2e8f0}" border-width="${2:1px}" padding="${3:0}" />',
    detail: "MJML horizontal divider",
  },
  {
    label: "mj-table",
    insertText: '<mj-table padding="${1:0}">\n  $0\n</mj-table>',
    detail: "MJML table element",
  },
  {
    label: "mj-wrapper",
    insertText: '<mj-wrapper padding="${1:24px 16px}">\n  $0\n</mj-wrapper>',
    detail: "MJML wrapper (full-width section)",
  },
  {
    label: "mj-spacer",
    insertText: '<mj-spacer height="${1:20px}" />',
    detail: "MJML vertical spacer",
  },
  {
    label: "mj-attributes",
    insertText: "<mj-attributes>\n  $0\n</mj-attributes>",
    detail: "MJML default attributes block",
  },
  {
    label: "mj-style",
    insertText: "<mj-style>\n  $0\n</mj-style>",
    detail: "MJML inline CSS styles",
  },
  {
    label: "mj-head",
    insertText: "<mj-head>\n  $0\n</mj-head>",
    detail: "MJML head section",
  },
  {
    label: "mj-body",
    insertText: "<mj-body>\n  $0\n</mj-body>",
    detail: "MJML body section",
  },
];

interface Disposable {
  dispose(): void;
}

/**
 * Register Handlebars + MJML autocomplete for the MJML template editor.
 * Returns a disposable to clean up the providers on unmount.
 */
export function registerMjmlCompletionProviders(
  monaco: Monaco,
  payload: Record<string, unknown>,
): Disposable {
  const paths = extractPaths(payload);
  const disposables: Disposable[] = [];

  // --- Handlebars variable & helper completions (trigger on `{`) ---
  disposables.push(
    monaco.languages.registerCompletionItemProvider("xml", {
      triggerCharacters: ["{", "."],
      provideCompletionItems(model, position) {
        const textUntilPosition = model.getValueInRange({
          startLineNumber: position.lineNumber,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column,
        });

        // Only suggest when inside {{ … }}
        const lastDoubleBrace = textUntilPosition.lastIndexOf("{{");

        if (lastDoubleBrace === -1) {
          return { suggestions: [] };
        }

        // Check we haven't already closed the braces
        const afterBrace = textUntilPosition.slice(lastDoubleBrace + 2);

        if (afterBrace.includes("}}")) {
          return { suggestions: [] };
        }

        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const suggestions: any[] = [];

        // Variable paths from payload
        for (const { path, isArray } of paths) {
          suggestions.push({
            label: path,
            kind: isArray
              ? monaco.languages.CompletionItemKind.Module
              : monaco.languages.CompletionItemKind.Variable,
            insertText: path,
            detail: isArray ? `Array – use with {{#each ${path}}}` : "Template variable",
            range,
            sortText: `0_${path}`,
          });
        }

        // Block helpers
        for (const helper of HANDLEBARS_HELPERS) {
          suggestions.push({
            label: helper.label,
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: helper.insertText,
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: helper.detail,
            range,
            sortText: `1_${helper.label}`,
          });
        }

        return { suggestions };
      },
    }),
  );

  // --- MJML tag completions (trigger on `<`) ---
  disposables.push(
    monaco.languages.registerCompletionItemProvider("xml", {
      triggerCharacters: ["<"],
      provideCompletionItems(model, position) {
        const textUntilPosition = model.getValueInRange({
          startLineNumber: position.lineNumber,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column,
        });

        // Only suggest after < but not inside {{ }}
        const lastAngle = textUntilPosition.lastIndexOf("<");

        if (lastAngle === -1) {
          return { suggestions: [] };
        }

        const afterAngle = textUntilPosition.slice(lastAngle + 1);

        if (afterAngle.includes(">")) {
          return { suggestions: [] };
        }

        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };

        return {
          suggestions: MJML_TAGS.map((tag) => ({
            label: tag.label,
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: tag.insertText,
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: tag.detail,
            range,
          })),
        };
      },
    }),
  );

  return {
    dispose() {
      disposables.forEach((d) => d.dispose());
    },
  };
}
