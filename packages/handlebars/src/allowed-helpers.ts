/**
 * Explicitly allowed Handlebars helpers from the `handlebars-helpers` package.
 *
 * Each entry maps a helper name to the group it belongs to.
 * To disallow a helper after security review, remove or comment out the line.
 *
 * Available groups in handlebars-helpers:
 * array, code, collection, comparison, date, fs, html, i18n,
 * inflection, logging, markdown, match, math, misc, number,
 * object, path, regex, string, url
 */

export type HelperGroup =
  | "array"
  | "code"
  | "collection"
  | "comparison"
  | "date"
  | "fs"
  | "html"
  | "i18n"
  | "inflection"
  | "logging"
  | "markdown"
  | "match"
  | "math"
  | "misc"
  | "number"
  | "object"
  | "path"
  | "regex"
  | "string"
  | "url";

export const ALLOWED_HELPERS: Record<string, HelperGroup> = {
  // --- array ---
  after: "array",
  arrayify: "array",
  before: "array",
  eachIndex: "array",
  filter: "array",
  first: "array",
  forEach: "array",
  inArray: "array",
  isArray: "array",
  itemAt: "array",
  join: "array",
  equalsLength: "array",
  last: "array",
  length: "array",
  map: "array",
  pluck: "array",
  reverse: "array",
  some: "array",
  sort: "array",
  sortBy: "array",
  withAfter: "array",
  withBefore: "array",
  withFirst: "array",
  withGroup: "array",
  withLast: "array",
  withSort: "array",
  unique: "array",

  // --- code ---
  // embed: "code", - removed
  gist: "code",
  jsfiddle: "code",

  // --- collection ---
  isEmpty: "collection",
  iterate: "collection",

  // --- comparison ---
  and: "comparison",
  compare: "comparison",
  contains: "comparison",
  default: "comparison",
  eq: "comparison",
  gt: "comparison",
  gte: "comparison",
  has: "comparison",
  isFalsey: "comparison",
  isTruthy: "comparison",
  ifEven: "comparison",
  ifNth: "comparison",
  ifOdd: "comparison",
  is: "comparison",
  isnt: "comparison",
  lt: "comparison",
  lte: "comparison",
  neither: "comparison",
  not: "comparison",
  or: "comparison",
  unlessEq: "comparison",
  unlessGt: "comparison",
  unlessLt: "comparison",
  unlessGteq: "comparison",
  unlessLteq: "comparison",

  // --- date ---
  year: "date",
  moment: "date",
  date: "date",

  // --- fs ---
  // read: "fs",
  // readdir: "fs",

  // --- html ---
  attr: "html",
  css: "html",
  js: "html",
  sanitize: "html",
  ul: "html",
  ol: "html",
  thumbnailImage: "html",

  // --- i18n ---
  i18n: "i18n",

  // --- inflection ---
  inflect: "inflection",
  ordinalize: "inflection",

  // --- logging ---
  // removed

  // --- markdown ---
  // markdown: "markdown",
  // md: "markdown",

  // --- match ---
  // match: "match", - removed
  // isMatch: "match",
  // mm: "match",

  // --- math ---
  abs: "math",
  add: "math",
  avg: "math",
  ceil: "math",
  divide: "math",
  floor: "math",
  minus: "math",
  modulo: "math",
  multiply: "math",
  plus: "math",
  random: "math",
  remainder: "math",
  round: "math",
  subtract: "math",
  sum: "math",
  times: "math",

  // --- misc ---
  option: "misc",
  noop: "misc",
  withHash: "misc",

  // --- number ---
  bytes: "number",
  addCommas: "number",
  phoneNumber: "number",
  toAbbr: "number",
  toExponential: "number",
  toFixed: "number",
  toFloat: "number",
  toInt: "number",
  toPrecision: "number",

  // --- object ---
  // extend: "object", removed
  // forIn: "object",
  // forOwn: "object",
  // toPath: "object",
  // get: "object",
  // getObject: "object",
  // hasOwn: "object",
  // isObject: "object",
  // JSONparse: "object",
  // JSONstringify: "object",
  // merge: "object",
  // pick: "object",

  // --- path ---
  absolute: "path",
  dirname: "path",
  relative: "path",
  basename: "path",
  stem: "path",
  extname: "path",
  // resolve: "path", removed
  segments: "path",

  // --- regex ---
  toRegex: "regex",
  test: "regex",

  // --- string ---
  append: "string",
  camelcase: "string",
  capitalize: "string",
  capitalizeAll: "string",
  center: "string",
  chop: "string",
  dashcase: "string",
  dotcase: "string",
  downcase: "string",
  ellipsis: "string",
  hyphenate: "string",
  isString: "string",
  lowercase: "string",
  occurrences: "string",
  pascalcase: "string",
  pathcase: "string",
  plusify: "string",
  prepend: "string",
  raw: "string",
  remove: "string",
  removeFirst: "string",
  replace: "string",
  replaceFirst: "string",
  sentence: "string",
  snakecase: "string",
  split: "string",
  startsWith: "string",
  titleize: "string",
  trim: "string",
  trimLeft: "string",
  trimRight: "string",
  truncate: "string",
  truncateWords: "string",
  upcase: "string",
  uppercase: "string",

  // --- url ---
  encodeURI: "url",
  escape: "url",
  decodeURI: "url",
  url_encode: "url",
  url_decode: "url",
  urlResolve: "url",
  urlParse: "url",
  stripQuerystring: "url",
  stripProtocol: "url",
};
