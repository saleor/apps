### Part 1: Create an S3 bucket

1. In the AWS console search for `S3` service and go there
2. On the S3 page click `Create bucket`
3. Provide your bucket name and click `Create bucket`.
4. Now you have your bucket

### Part 2: Create a user with S3 permissions

1. In the AWS console search for `IAM` service and go there
2. Go to the `Users` tab and click `Create user`
3. Provide the user name and click `Next`
4. Select `Attach policies directly` and search for `AmazonS3FullAccess`
5. Select `AmazonS3FullAccess` and click `Next`
6. Finish the process by clicking the `Create user` button

### Part 3: Generating access key for the user

1. In the AWS console search for `IAM` service and go there
2. Go to the `Users` tab and choose the previously created user
3. Select the `Security credentials` tab and access key section
4. Click `Create access key`
5. From the list choose `Third-party service`, select the confirmation checkbox and click `Next`
6. Finish the process by clicking the `Create access key` button
7. Now you should see your access and secret key, copy them and store them somewhere and click `Done`
