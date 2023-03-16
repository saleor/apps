import ProviderInstancesList from "./provider-instances-list";
import { Instructions } from "../../ui/instructions";
import ProviderInstanceConfiguration from "./provider-instance-configuration";
import { providersConfig, ProvidersSchema, SingleProviderSchema } from "../../../lib/cms/config";
import { useEffect, useState } from "react";
import useProviderInstances from "./hooks/useProviderInstances";

const ProviderInstances = () => {
  const { providerInstances, saveProviderInstance, deleteProviderInstance, loading, errors } =
    useProviderInstances();

  const [activeProviderInstanceId, setActiveProviderInstanceId] = useState<string | null>(
    providerInstances.length ? providerInstances[0].id : null
  );
  const [newProviderInstance, setNewProviderInstance] = useState<SingleProviderSchema | null>(null);

  const handleSetActiveProviderInstance = (providerInstance: SingleProviderSchema | null) => {
    setActiveProviderInstanceId(providerInstance?.id || null);

    if (newProviderInstance) {
      setNewProviderInstance(null);
    }
  };
  const handleAddNewProviderInstance = () => {
    setNewProviderInstance({} as SingleProviderSchema);

    if (activeProviderInstanceId) {
      setActiveProviderInstanceId(null);
    }
  };
  const handleSaveProviderInstance = async (providerInstance: SingleProviderSchema) => {
    const savedProviderInstance = await saveProviderInstance(providerInstance);

    if (newProviderInstance) {
      setNewProviderInstance(null);
    }
    if (newProviderInstance && savedProviderInstance) {
      setActiveProviderInstanceId(savedProviderInstance.id);
    }
  };
  const handleDeleteProviderInstance = async (providerInstance: SingleProviderSchema) => {
    await deleteProviderInstance(providerInstance);

    if (activeProviderInstanceId === providerInstance.id) {
      setActiveProviderInstanceId(null);
    }
  };

  const activeProviderInstance = providerInstances.find(
    (providerInstance) => providerInstance.id === activeProviderInstanceId
  );

  return (
    <>
      <ProviderInstancesList
        providerInstances={providerInstances}
        activeProviderInstance={activeProviderInstance}
        newProviderInstance={newProviderInstance}
        setActiveProviderInstance={handleSetActiveProviderInstance}
        requestAddProviderInstance={handleAddNewProviderInstance}
        loading={loading}
        errors={errors}
      />
      <ProviderInstanceConfiguration
        activeProviderInstance={activeProviderInstance}
        newProviderInstance={newProviderInstance}
        saveProviderInstance={handleSaveProviderInstance}
        deleteProviderInstance={handleDeleteProviderInstance}
        loading={loading}
        errors={errors}
      />
      <Instructions />
    </>
  );
};

export default ProviderInstances;
