## How to test product sync between Saleor and cms provider

We can use Contentful as example:
You can skip step 2 to 4 when you have already app and cms provider configured

1. Go to Contentful, login or create free account
2. Create content model for Saleor product variant
   ![content-types.png](images/content-types.png)
3. Copy the space Id from general settings and paste it into the app configuration
   ![space-id/png](images/space-id.png)
4. Go to CMA tokens create a new personal access token and paste it into the app configuration
   ![cms-token.png](images/cms-token.png)
5. Update fields mapping in the app
   ![field-mapping.png](images/field-mapping.png)
6. Go to Dashboard and try to update/create product and variant
7. You should see variants in content tab in Contentful
   ![content.png](images/content.png)
