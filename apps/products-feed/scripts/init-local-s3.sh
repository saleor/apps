#!/bin/bash
awslocal s3api \
create-bucket --bucket product-feed \
--create-bucket-configuration LocationConstraint=eu-west-2 \
--region eu-west-2