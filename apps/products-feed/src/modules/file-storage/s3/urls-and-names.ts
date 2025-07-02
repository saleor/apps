import { RootConfig } from "../../app-configuration/app-config";

interface GetDownloadUrlArgs {
  s3BucketConfiguration: Exclude<RootConfig["s3"], null>;
  saleorApiUrl: string;
  channel: string;
}

export const getDownloadUrl = ({
  s3BucketConfiguration,
  saleorApiUrl,
  channel,
}: GetDownloadUrlArgs) => {
  return `https://${s3BucketConfiguration.bucketName}.s3.${
    s3BucketConfiguration.region
  }.amazonaws.com/${getFileName({ saleorApiUrl, channel })}`;
};

interface GetFileNameArgs {
  saleorApiUrl: string;
  channel: string;
}

export const getFileName = ({ saleorApiUrl, channel }: GetFileNameArgs) => {
  const apiUrl = new URL(saleorApiUrl);

  return `${apiUrl.hostname}/${channel}/google.xml`;
};

export const getChunkFileName = ({
  saleorApiUrl,
  channel,
  cursor,
}: GetFileNameArgs & { cursor: string }) => {
  const apiUrl = new URL(saleorApiUrl);

  return `${apiUrl.hostname}/${channel}/chunk-${cursor}.xml`;
};
