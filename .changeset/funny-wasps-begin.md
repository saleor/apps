---
"saleor-app-avatax": minor
---

Adding support to overwrite the shipFrom address in the avatax calculation using private metadata on order or checkout object. Example:
{
  "key": "avataxShipFromAddress", 
  "value": "{\"street\":\"123 Custom Street\",\"city\":\"Custom City\",\"state\":\"CA\",\"zip\":\"90210\",\"country\":\"US\"}"
}
