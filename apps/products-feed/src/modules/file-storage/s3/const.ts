/*
 * AWS multipart uploads require a minimum file size of 5 MB.
 * https://docs.aws.amazon.com/AmazonS3/latest/userguide/qfacts.html
 */

export const MULTI_PART_SIZE_THRESHOLD = 5 * 1024 * 1024;
