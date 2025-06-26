#!/bin/bash
awslocal s3api \
create-bucket --bucket product-feed \
--create-bucket-configuration LocationConstraint=us-east-2 \
--region us-east-2 \
--acl public-read