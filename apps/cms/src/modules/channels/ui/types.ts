export interface ChannelsLoading {
  fetching: boolean;
  saving: boolean;
}

export interface ChannelsErrors {
  fetching?: Error | null;
  saving?: Error | null;
}
