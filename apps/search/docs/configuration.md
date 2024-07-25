## Algolia configuration

### Keys

1. Login or create [Algolia](http://google.pl) account
2. Go to Settings - API Keys
   ![keys.png](./images/keys.png)
3. Copy Application Id and Admin API Key

### Grouping

To provide the most precise search results on variant level, Search app uploads each variant as separate document. Most likely you would like to group results by product. To achieve that, navigate to index settings:

![](images/index_initial.png)

At the menu on the left choose `Deduplication and Grouping`. Change value of distinct to `true` and set attribute as `productId`. If attribute is not there, make sure you already reindexed your products

![](images/index_configuration.png)

After saving the changes variants will be displayed as single product:

![](images/index_configured.png)

## App configuration

1. Go to app, in `Algolia settings` section provide required Application ID and Admin API Key
2. Save config
3. Go to `Algolia fields filtering` section and select which field should be sent to Algolia
4. Go to `Index products` section and click `Start importing` to perform initial product sync

## How to test your configuration

1. Go to Dashboard and update name one of the products
2. You should see change in Algolia
