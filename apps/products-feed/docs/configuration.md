## How to configure the app:

1. Go to app
2. If you want to store xml in S3 bucket provide this information and save config ([Here](./s3BucketSetup) you can find doc how to create new bucket):

- AWS access key id
- AWS secret access key
- Bucket name
- Bucket region

3. Choose channel for which you want to generate feed
4. Provide required URLs for storefront and product and save

## How to test your configuration:

1. Go to the app, open channel you selected, below in the same section, in the `Test your feed subsection` click on the button `Open feed in a new tab`
2. New tab should open, wait a couple of seconds for the generated feed. If you configured S3 bucket generated file should be uploaded there.
