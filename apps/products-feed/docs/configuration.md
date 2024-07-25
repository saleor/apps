## How to configure the Products feed app:

1. Go to the app
2. If you want to store an XML file in an S3 bucket provide this information and save the config ([Here](./s3BucketSetup) you can find a doc on how to create a new bucket):

- AWS access key ID
- AWS secret access key
- Bucket name
- Bucket region

3. Choose the channel for which you want to generate the feed
4. Provide required URLs for storefront and product and save

## How to test your configuration:

1. Go to the app and open the channel you selected, below in the same section, in the `Test your feed subsection` click on the button `Open feed in a new tab`
2. A new tab should open, wait a couple of seconds for the generated feed. If you configured the S3 bucket generated file should be uploaded there.
