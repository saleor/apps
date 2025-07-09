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
