export interface ProvidersLoading {
  fetching: boolean;
  saving: boolean;
}

export interface ProvidersErrors {
  fetching?: Error | null;
  saving?: Error | null;
}
