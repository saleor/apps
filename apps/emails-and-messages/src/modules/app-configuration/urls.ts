export const channelUrls = {
  configuration: (id?: string) =>
    !id ? "/configuration/channels" : `/configuration/channels/${id}`,
};
