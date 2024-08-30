import { ButtonsBox, SkeletonLayout } from "@saleor/apps-ui";
import { Button, Text } from "@saleor/macaw-ui";

import { trpcClient } from "../trpc/trpc-client";
import { Modal } from "../ui/modal";
import {
  AddConnectionForm,
  AddConnectionFormID,
  AddConnectionFormSchema,
} from "./add-connection-form";

const defaultValues: AddConnectionFormSchema = { channelSlug: "", providerId: "" };

export const AddConnectionModal = (props: { onSuccess(): void; onClose(): void }) => {
  const { data: providers } = trpcClient.providersConfigs.getAll.useQuery();

  if (!providers) {
    return <SkeletonLayout.Section />;
  }

  const { mutateAsync: addProviderMutate, isLoading } =
    trpcClient.channelsProvidersConnection.addConnection.useMutation({
      onSuccess() {
        props.onSuccess();
      },
    });

  const handleFormSubmit = async (values: AddConnectionFormSchema) => {
    const providerType = providers.find((p) => p.id === values.providerId)?.type;

    if (!providerType) {
      throw new Error("Provider not found");
    }

    return addProviderMutate({
      ...values,
      providerType,
    });
  };

  return (
    <Modal onClose={props.onClose}>
      <Text as="h2" size={5} fontWeight="bold">
        Connect channel with Provider
      </Text>
      <Text as="p" marginBottom={6}>
        Once connected, operations on product variants on this channel will be sent to selected CMS
        platform.
      </Text>
      <AddConnectionForm onSubmit={handleFormSubmit} defaultValues={defaultValues} />
      <ButtonsBox marginTop={8}>
        <Button
          disabled={isLoading}
          variant="tertiary"
          onClick={() => {
            props.onClose();
          }}
        >
          Close
        </Button>
        <Button variant="primary" type="submit" form={AddConnectionFormID}>
          Add connection
        </Button>
      </ButtonsBox>
    </Modal>
  );
};
