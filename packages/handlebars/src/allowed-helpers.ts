/**
 * Explicitly allowed Handlebars helpers from the `handlebars-helpers` package.
 *
 * Each key is a group name (matching `handlebars-helpers/lib/<group>`),
 * and the value is the list of helper names to register from that group.
 *
 * To disallow a helper, remove it from the array.
 * To disallow an entire group, remove or comment out the entry.
 * Groups not listed here are never loaded.
 */
export const ALLOWED_HELPERS: Record<string, string[]> = {
  // --- array ---
  array: [
    "after",
    "arrayify",
    "before",
    "eachIndex",
    "filter",
    "first",
    "forEach",
    "inArray",
    "isArray",
    "itemAt",
    "join",
    "equalsLength",
    "last",
    "length",
    "map",
    "pluck",
    "reverse",
    "some",
    "sort",
    "sortBy",
    "withAfter",
    "withBefore",
    "withFirst",
    "withGroup",
    "withLast",
    "withSort",
    "unique",
  ],

  // --- code (embed removed) ---
  code: ["gist", "jsfiddle"],

  // --- collection ---
  collection: ["isEmpty", "iterate"],

  // --- comparison ---
  comparison: [
    "and",
    "compare",
    "contains",
    "default",
    "eq",
    "gt",
    "gte",
    "has",
    "isFalsey",
    "isTruthy",
    "ifEven",
    "ifNth",
    "ifOdd",
    "is",
    "isnt",
    "lt",
    "lte",
    "neither",
    "not",
    "or",
    "unlessEq",
    "unlessGt",
    "unlessLt",
    "unlessGteq",
    "unlessLteq",
  ],

  // --- date ---
  date: ["year", "moment", "date"],

  // --- fs: removed entirely ---

  // --- html ---
  html: ["attr", "css", "js", "sanitize", "ul", "ol", "thumbnailImage"],

  // --- i18n ---
  i18n: ["i18n"],

  // --- inflection ---
  inflection: ["inflect", "ordinalize"],

  // --- logging: removed entirely ---

  // --- markdown: removed entirely ---

  // --- match: removed entirely ---

  // --- math ---
  math: [
    "abs",
    "add",
    "avg",
    "ceil",
    "divide",
    "floor",
    "minus",
    "modulo",
    "multiply",
    "plus",
    "random",
    "remainder",
    "round",
    "subtract",
    "sum",
    "times",
  ],

  // --- misc ---
  misc: ["option", "noop", "withHash"],

  // --- number ---
  number: [
    "bytes",
    "addCommas",
    "phoneNumber",
    "toAbbr",
    "toExponential",
    "toFixed",
    "toFloat",
    "toInt",
    "toPrecision",
  ],

  // --- object: removed entirely ---

  // --- path (resolve removed) ---
  path: ["absolute", "dirname", "relative", "basename", "stem", "extname", "segments"],

  // --- regex ---
  regex: ["toRegex", "test"],

  // --- string ---
  string: [
    "append",
    "camelcase",
    "capitalize",
    "capitalizeAll",
    "center",
    "chop",
    "dashcase",
    "dotcase",
    "downcase",
    "ellipsis",
    "hyphenate",
    "isString",
    "lowercase",
    "occurrences",
    "pascalcase",
    "pathcase",
    "plusify",
    "prepend",
    "raw",
    "remove",
    "removeFirst",
    "replace",
    "replaceFirst",
    "sentence",
    "snakecase",
    "split",
    "startsWith",
    "titleize",
    "trim",
    "trimLeft",
    "trimRight",
    "truncate",
    "truncateWords",
    "upcase",
    "uppercase",
  ],

  // --- url ---
  url: [
    "encodeURI",
    "escape",
    "decodeURI",
    "url_encode",
    "url_decode",
    "urlResolve",
    "urlParse",
    "stripQuerystring",
    "stripProtocol",
  ],
};
