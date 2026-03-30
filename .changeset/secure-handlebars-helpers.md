---
"saleor-app-smtp": major
"saleor-app-products-feed": major
---

Due to security concerns, some Handlebars helpers have been removed.

Removed groups: `fs`, `logging`, `markdown`, `match`, `object`.
Removed individual helpers: `embed` (from `code`), `resolve` (from `path`).

Allowed helpers:

- **array**: `after`, `arrayify`, `before`, `eachIndex`, `filter`, `first`, `forEach`, `inArray`, `isArray`, `itemAt`, `join`, `equalsLength`, `last`, `length`, `map`, `pluck`, `reverse`, `some`, `sort`, `sortBy`, `withAfter`, `withBefore`, `withFirst`, `withGroup`, `withLast`, `withSort`, `unique`
- **code**: `gist`, `jsfiddle`
- **collection**: `isEmpty`, `iterate`
- **comparison**: `and`, `compare`, `contains`, `default`, `eq`, `gt`, `gte`, `has`, `isFalsey`, `isTruthy`, `ifEven`, `ifNth`, `ifOdd`, `is`, `isnt`, `lt`, `lte`, `neither`, `not`, `or`, `unlessEq`, `unlessGt`, `unlessLt`, `unlessGteq`, `unlessLteq`
- **date**: `year`, `moment`, `date`
- **html**: `attr`, `css`, `js`, `sanitize`, `ul`, `ol`, `thumbnailImage`
- **i18n**: `i18n`
- **inflection**: `inflect`, `ordinalize`
- **math**: `abs`, `add`, `avg`, `ceil`, `divide`, `floor`, `minus`, `modulo`, `multiply`, `plus`, `random`, `remainder`, `round`, `subtract`, `sum`, `times`
- **misc**: `option`, `noop`, `withHash`
- **number**: `bytes`, `addCommas`, `phoneNumber`, `toAbbr`, `toExponential`, `toFixed`, `toFloat`, `toInt`, `toPrecision`
- **path**: `absolute`, `dirname`, `relative`, `basename`, `stem`, `extname`, `segments`
- **regex**: `toRegex`, `test`
- **string**: `append`, `camelcase`, `capitalize`, `capitalizeAll`, `center`, `chop`, `dashcase`, `dotcase`, `downcase`, `ellipsis`, `hyphenate`, `isString`, `lowercase`, `occurrences`, `pascalcase`, `pathcase`, `plusify`, `prepend`, `raw`, `remove`, `removeFirst`, `replace`, `replaceFirst`, `sentence`, `snakecase`, `split`, `startsWith`, `titleize`, `trim`, `trimLeft`, `trimRight`, `truncate`, `truncateWords`, `upcase`, `uppercase`
- **url**: `encodeURI`, `escape`, `decodeURI`, `url_encode`, `url_decode`, `urlResolve`, `urlParse`, `stripQuerystring`, `stripProtocol`
