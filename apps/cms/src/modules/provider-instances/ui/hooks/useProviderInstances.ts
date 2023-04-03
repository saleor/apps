import { useProviderInstancesFetch } from "./useProviderInstancesFetch";
import { SingleProviderSchema } from "../../../../lib/cms/config";
import { ProvidersErrors, ProvidersLoading } from "../types";

export const useProviderInstances = () => {
  const {
    saveProviderInstance: saveProviderInstanceFetch,
    deleteProviderInstance: deleteProviderInstanceFetch,
    isSaving,
    data: settings,
    error: fetchingError,
    isFetching,
  } = useProviderInstancesFetch();

  const saveProviderInstance = async (providerInstanceToSave: SingleProviderSchema) => {
    return await saveProviderInstanceFetch(providerInstanceToSave);
  };

  const deleteProviderInstance = async (providerInstanceToDelete: SingleProviderSchema) => {
    console.log("deleteProviderInstance", providerInstanceToDelete);

    await deleteProviderInstanceFetch(providerInstanceToDelete);
  };

  const loading: ProvidersLoading = {
    fetching: isFetching,
    saving: isSaving,
  };

  const errors: ProvidersErrors = {
    fetching: fetchingError ? Error(fetchingError) : null,
    saving: null,
  };

  const providerInstances =
    (settings &&
      Object.entries(settings).map(([key, values]) => ({
        ...values,
      }))) ||
    [];

  return { providerInstances, saveProviderInstance, deleteProviderInstance, loading, errors };
};
