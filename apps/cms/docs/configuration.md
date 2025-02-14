## How to configure the CMS app:

We can use Contentful as an example:

1. Go to Contentful, log in or create a free account
2. Create a content model for Saleor product variant
   ![content-types.png](images/content-types.png)
3. Copy the Space ID from general settings and paste it into the app configuration
   ![space-id/png](images/space-id.png)
4. Go to CMA tokens, create a new personal access token and paste it into the app configuration
   ![cms-token.png](images/cms-token.png)
5. Update fields mapping in the app
   ![field-mapping.png](images/field-mapping.png)

## How to test your configuration:

If you set up your configuration like the above we can now test the connection between Saleor and Contentful.

1. Go to Dashboard and try to update/create product and variant
2. You should see variants in content tab in Contentful
   ![content.png](images/content.png)
