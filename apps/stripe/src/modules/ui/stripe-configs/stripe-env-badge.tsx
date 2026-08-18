import { Text } from "@saleor/macaw-ui";

import { type StripeEnv } from "@/modules/stripe/stripe-env";

import styles from "./stripe-env-badge.module.css";
import { stripeEnvLabel } from "./stripe-env-label";

type Props = {
  env: StripeEnv;
  "data-test-id"?: string;
};

/**
 * Compact Sandbox / Live pill for config card headers.
 *
 * Geometry follows Geist/Vercel status badges (`padding: 0 10px`, `border-radius: 9999px`)
 * and Dashboard status `Pill` capsules — wider X than Y so the rounded caps don’t pinch the label.
 * Colors follow Stripe Dashboard mode chrome (navy sandbox, blurple live).
 */
export const StripeEnvBadge = ({ env, "data-test-id": dataTestId }: Props): JSX.Element => {
  const isSandbox = env === "TEST";
  const title = isSandbox ? "Stripe sandbox keys" : "Stripe live keys";

  return (
    <Text
      as="span"
      size={1}
      fontWeight="medium"
      title={title}
      className={`${styles.pill} ${isSandbox ? styles.sandbox : styles.live}`}
      data-test-id={
        dataTestId ?? (isSandbox ? "stripe-env-badge-sandbox" : "stripe-env-badge-live")
      }
    >
      {stripeEnvLabel(env)}
    </Text>
  );
};

StripeEnvBadge.displayName = "StripeEnvBadge";
