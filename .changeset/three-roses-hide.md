---
"search": patch
---

Fixed "boolean" attribute type mapping. Now it will look for raw boolean value (attribute.value.boolean) instead trying to stringify attribute name. The rest of attribute types were not touched.
