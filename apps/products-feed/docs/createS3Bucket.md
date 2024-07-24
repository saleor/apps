### Part 1: Create S3 bucket

1. In AWS console search for `S3` service and go there
2. In S3 page click `Create bucket`
3. Provide your bucket name and click `Create bucket`.
4. Now you have your bucket

### Part 2: Create user with S3 permissions

1. In AWS console search for `IAM` service and go there
2. Go to `Users` tab and click `Create user`
3. Provide user name and click `Next`
4. Select `Attach policies directly` and search for `AmazonS3FullAccess`
5. Select `AmazonS3FullAccess` and click `Next`
6. Finish process by clicking `Create user` button

### Part 3: Generating access key for user

1. In AWS console search for `IAM` service and go there
2. Go to `Users` tab and choose previously create user
3. Select `Security credentials` tab and to access key section
4. Click `Create access key`
5. From the list choose `Third-party service`, select confirmation checkbox and click `Next`
6. Finish process by clicking `Create access key` button
7. Now you should see you access and secret key, copy them and store somewhere, click `Done`
