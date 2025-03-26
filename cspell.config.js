/**
 * @type { import("@cspell/cspell-types").CSpellUserSettings }
 */
export default {
  patterns: [
    {
      name: "comment-single-line",
      pattern: "/#.*/g",
    },
    {
      name: "comment-multi-line",
      pattern: "/(?:\\/\\*[\\s\\S]*?\\*\\/)/g",
    },
    {
      name: "comments",
      pattern: ["comment-single-line", "comment-multi-line"],
    },
    {
      name: "logger",
      pattern: "/logger\\.(?:warn|error|info|debug)\\(.*\\)/g",
    },
  ],
  languageSettings: [
    {
      languageId: "markdown",
      caseSensitive: true,
    },
    {
      languageId: ["javascriptreact", "typescriptreact", "typescript", "javascript"],
      includeRegExpList: ["comments", "logger"],
    },
  ],
  words: [
    "avalara",
    "avatax",
    "bruno",
    "codegen",
    "tseslint",
    "contentful",
    "corepack",
    "datocms",
    "devcontainer",
    "klaviyo",
    "mailhog",
    "mjml",
    "neverthrow",
    "nygard",
    "opentelemetry",
    "pactum",
    "parentbased",
    "pryce",
    "quickstart",
    "saleor",
    "sendgrid",
    "shopx",
    "strapi",
    "taxjar",
    "toolset",
    "traceidratio",
    "turborepo",
    "unobfuscated",
    "upserted",
    "upserting",
    "upstash",
    "urql",
  ],
  language: "en-US",
  useGitignore: true,
  ignorePaths: ["**/graphql.ts", "**/CHANGELOG.md", "**/schema.graphql", "**/generated/types.ts"],
};
