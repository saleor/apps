import { Box, Button, CloseIcon, Modal, Text } from "@saleor/macaw-ui";

export const DeleteConfigurationModalContent = (props: { onDeleteClick: () => void }) => {
  return (
    <Modal.Content>
      <Box
        backgroundColor="default1"
        boxShadow="defaultModal"
        __left="50%"
        __top="50%"
        position="fixed"
        __maxWidth="600px"
        __width="calc(100% - 64px)"
        __transform="translate(-50%, -50%)"
        padding={6}
        display="grid"
        gap={3}
        borderRadius={4}
      >
        <Box display="flex" justifyContent="space-between">
          <Text size={6} fontWeight="bold">
            Delete configuration
          </Text>
          <Modal.Close>
            <Button variant="tertiary" icon={<CloseIcon />} size="small" />
          </Modal.Close>
        </Box>
        <Text>Are you sure you want to delete this configuration?</Text>
        <Box display="flex" justifyContent="flex-end" gap={3}>
          <Modal.Close>
            <Button variant="secondary">Cancel</Button>
          </Modal.Close>
          <Button variant="error" onClick={props.onDeleteClick}>
            Delete
          </Button>
        </Box>
      </Box>
    </Modal.Content>
  );
};
