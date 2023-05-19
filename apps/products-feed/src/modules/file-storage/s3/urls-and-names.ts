import { S3BucketConfiguration } from "../../app-configuration/app-config";

interface GetDownloadUrlArgs {
  s3BucketConfiguration: S3BucketConfiguration;
  saleorApiUrl: string;
}

export const getDownloadUrl = ({ s3BucketConfiguration, saleorApiUrl }: GetDownloadUrlArgs) => {
  return `https://${s3BucketConfiguration.bucketName}.s3.${
    s3BucketConfiguration.region
  }.amazonaws.com/${getFileName({ saleorApiUrl })}`;
};

interface GetFileNameArgs {
  saleorApiUrl: string;
}

export const getFileName = ({ saleorApiUrl }: GetFileNameArgs) => {
  const apiUrl = new URL(saleorApiUrl);

  return `${apiUrl.hostname}/google.xml`;
};
