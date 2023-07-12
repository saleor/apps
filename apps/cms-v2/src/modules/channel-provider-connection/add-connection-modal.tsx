import { Button, Text } from "@saleor/macaw-ui/next";
import { ButtonsBox } from "../ui/buttons-box";
import { Modal } from "../ui/modal";
import {
  AddConnectionForm,
  AddConnectionFormID,
  AddConnectionFormSchema,
} from "./add-connection-form";

const defaultValues: AddConnectionFormSchema = { channelSlug: "", providerId: "" };

export const AddConnectionModal = (props: {
  onSubmit(values: AddConnectionFormSchema): void;
  onClose(): void;
}) => (
  <Modal onClose={props.onClose}>
    <Text as="h2" variant="heading">
      Connect channel with Provider
    </Text>
    <Text as="p" marginBottom={6}>
      Once connected, operations on product variants on this channel will be sent to selected CMS
      platform.
    </Text>
    <AddConnectionForm onSubmit={props.onSubmit} defaultValues={defaultValues} />
    <ButtonsBox marginTop={8}>
      <Button
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
