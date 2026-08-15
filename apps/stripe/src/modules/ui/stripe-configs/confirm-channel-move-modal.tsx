import { Box, Button, Modal, Text } from "@saleor/macaw-ui";

import { type StripeEnv } from "@/modules/stripe/stripe-env";

import { type ChannelMove } from "./build-channel-move-plan";
import { stripeEnvLabel } from "./stripe-env-label";

type Props = {
  /** Only moves that swap sandbox keys for live ones, or the other way around. */
  moves: ChannelMove[];
  targetConfigName: string;
  targetEnv: StripeEnv;
  isSaving?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export const ConfirmChannelMoveModal = ({
  moves,
  targetConfigName,
  targetEnv,
  isSaving = false,
  onConfirm,
  onClose,
}: Props) => (
  <Modal
    open={moves.length > 0}
    onChange={(open) => {
      if (!open) {
        onClose();
      }
    }}
  >
    <Modal.Content>
      <Box
        backgroundColor="default1"
        boxShadow="defaultModal"
        __left="50%"
        __top="50%"
        position="fixed"
        __maxWidth="560px"
        __width="calc(100% - 64px)"
        __transform="translate(-50%, -50%)"
        padding={6}
        display="grid"
        gap={3}
        borderRadius={4}
        data-test-id="confirm-channel-move-modal"
      >
        <Text size={6} fontWeight="bold">
          {targetEnv === "TEST"
            ? "Switch these channels to sandbox keys?"
            : "Switch these channels to live keys?"}
        </Text>
        <Text color="default2">
          {targetEnv === "TEST"
            ? `Checkout for them will stop taking real payments — ${targetConfigName} uses sandbox keys, which only accept test cards.`
            : `Checkout for them will start taking real payments with ${targetConfigName}.`}
        </Text>
        <Box display="grid" gap={1}>
          {moves.map((move) => (
            <Text key={move.channelId} size={2}>
              <Text size={2} fontWeight="medium">
                {move.channelName}
              </Text>{" "}
              <Text size={2} color="default2">
                — from {move.fromConfigName} ({stripeEnvLabel(move.fromEnv)}) to {targetConfigName}{" "}
                ({stripeEnvLabel(targetEnv)})
              </Text>
            </Text>
          ))}
        </Box>
        <Box display="flex" justifyContent="flex-end" gap={3}>
          <Button variant="secondary" disabled={isSaving} onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            disabled={isSaving}
            onClick={onConfirm}
            data-test-id="confirm-channel-move"
          >
            Move channels
          </Button>
        </Box>
      </Box>
    </Modal.Content>
  </Modal>
);
