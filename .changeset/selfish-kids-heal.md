---
"saleor-app-search": minor
---

Added a new `pricing` field to the Algolia object representation. It now passes variant pricing representation from GraphQL:

```graphQL
    price {
      gross {
        amount
      }
      net {
        amount
      }
    }
    discount {
      gross {
        amount
      }
      net {
        amount
      }
    }
    onSale
    priceUndiscounted {
      gross {
        amount
      }
      net {
        amount
      }
    }
```