import { Box, Select } from "@saleor/macaw-ui";

import {
  StripeFrontendConfig,
  type StripeFrontendConfigSerializedFields,
} from "@/modules/app-config/domain/stripe-config";

import styles from "./stripe-config-cards.module.css";
import { stripeEnvLabel } from "./stripe-env-label";

const PLACEHOLDER_VALUE = "";

type Props = {
  channelName: string;
  configs: StripeFrontendConfigSerializedFields[];
  disabled?: boolean;
  onAssign: (configId: string) => void;
};

/**
 * Assigns one unassigned channel to a configuration without opening a card editor — the
 * per-channel select the app had before configurations owned their own channel lists.
 *
 * Options carry the environment, because picking sandbox or live here decides whether that
 * channel takes real payments.
 */
export const AssignChannelSelect = ({
  channelName,
  configs,
  disabled = false,
  onAssign,
}: Props) => (
  <Box className={styles.assignSelect}>
    <Select
      size="small"
      aria-label={`Assign ${channelName} to a configuration`}
      disabled={disabled || configs.length === 0}
      value={PLACEHOLDER_VALUE}
      options={[
        { value: PLACEHOLDER_VALUE, label: "Assign to…" },
        ...configs.map((config) => ({
          value: config.id,
          label: `${config.name} · ${stripeEnvLabel(
            StripeFrontendConfig.createFromSerializedFields(config).getStripeEnvValue(),
          )}`,
        })),
      ]}
      onChange={(value) => {
        if (value === PLACEHOLDER_VALUE) {
          return;
        }

        onAssign(value);
      }}
      data-test-id={`assign-single-channel-${channelName}`}
    />
  </Box>
);
