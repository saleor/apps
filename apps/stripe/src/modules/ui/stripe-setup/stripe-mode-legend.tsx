import { TextLink } from "@saleor/apps-ui";
import { AsideInfoCard } from "@saleor/apps-ui-next";
import { Box, Text } from "@saleor/macaw-ui";

import styles from "./stripe-mode-legend.module.css";

const STRIPE_API_KEYS_URL = "https://dashboard.stripe.com/apikeys";
const STRIPE_KEYS_DOCS_URL = "https://docs.stripe.com/keys";
const STRIPE_SANDBOXES_DOCS_URL = "https://docs.stripe.com/sandboxes/dashboard/manage";
const SALEOR_SCOPES_DOCS_URL =
  "https://docs.saleor.io/developer/app-store/apps/stripe/configuration";

/**
 * Left-rail legend for infrequent Stripe setup: which mode to use, how keys look,
 * and (behind a fold) where to create a restricted key in Stripe Dashboard.
 */
export const StripeModeLegend = () => (
  <AsideInfoCard
    title="Sandbox vs live"
    data-test-id="stripe-mode-legend"
    fold={{
      title: "Get keys in Stripe Dashboard",
      children: (
        <Box className={styles.foldContent}>
          <Box as="ol" className={styles.steps}>
            <Box as="li" className={styles.step}>
              <Text size={1} color="default2">
                In Stripe, open the account picker (top left) →{" "}
                <Text as="span" size={1} fontWeight="medium" color="default1">
                  Switch to sandbox
                </Text>{" "}
                → create a sandbox or open an existing one. Stay in your live account for live keys.
                A banner at the top of the Dashboard confirms you are in a sandbox.
              </Text>
            </Box>
            <Box as="li" className={styles.step}>
              <Text size={1} color="default2">
                Go to{" "}
                <Text as="span" size={1} fontWeight="medium" color="default1">
                  Developers → API keys
                </Text>
                . Copy the{" "}
                <Text as="span" size={1} fontWeight="medium" color="default1">
                  Publishable key
                </Text>
                .
              </Text>
            </Box>
            <Box as="li" className={styles.step}>
              <Text size={1} color="default2">
                Create a{" "}
                <Text as="span" size={1} fontWeight="medium" color="default1">
                  Restricted key
                </Text>{" "}
                (not the secret key) with Write access for the scopes below. Paste it here — the app
                creates the Stripe webhook when you save.
              </Text>
            </Box>
          </Box>

          <Box className={styles.scopesCallout} role="status">
            <Text size={2} fontWeight="medium">
              Restricted key scopes
            </Text>
            <Box as="ul" className={styles.scopes}>
              <Box as="li" className={styles.scope}>
                <Text size={1} color="default2">
                  Payment Intents — Write
                </Text>
              </Box>
              <Box as="li" className={styles.scope}>
                <Text size={1} color="default2">
                  Charges and Refunds — Write
                </Text>
              </Box>
              <Box as="li" className={styles.scope}>
                <Text size={1} color="default2">
                  Webhook Endpoints — Write
                </Text>
              </Box>
              <Box as="li" className={styles.scope}>
                <Text size={1} color="default2">
                  Payment Methods — Read
                </Text>
              </Box>
            </Box>
          </Box>

          <Box className={styles.links}>
            <TextLink href={STRIPE_API_KEYS_URL} newTab size={1}>
              Open Stripe API keys
            </TextLink>
            <TextLink href={STRIPE_SANDBOXES_DOCS_URL} newTab size={1}>
              Manage sandboxes
            </TextLink>
            <TextLink href={STRIPE_KEYS_DOCS_URL} newTab size={1}>
              Stripe key documentation
            </TextLink>
            <TextLink href={SALEOR_SCOPES_DOCS_URL} newTab size={1}>
              Saleor required scopes
            </TextLink>
          </Box>
        </Box>
      ),
    }}
  >
    <Box className={styles.intro}>
      <Text size={2} color="default2">
        Each configuration is either sandbox (test) or live. Publishable and restricted keys must be
        from the same mode — mixing them is rejected when you save.
      </Text>

      <Box as="ul" className={styles.modes}>
        <Box as="li" className={styles.mode}>
          <Box className={styles.modeTitle}>
            <Box className={`${styles.swatch} ${styles.swatchTest}`} aria-hidden />
            <Text size={2} fontWeight="medium">
              Sandbox
            </Text>
          </Box>
          <Text size={1} color="default2" className={styles.modeDescription}>
            Keys start with{" "}
            <Text as="span" className={styles.prefix} color="default1">
              pk_test
            </Text>{" "}
            /{" "}
            <Text as="span" className={styles.prefix} color="default1">
              rk_test
            </Text>
            . Use for development and staging — no real charges.
          </Text>
        </Box>
        <Box as="li" className={styles.mode}>
          <Box className={styles.modeTitle}>
            <Box className={`${styles.swatch} ${styles.swatchLive}`} aria-hidden />
            <Text size={2} fontWeight="medium">
              Live
            </Text>
          </Box>
          <Text size={1} color="default2" className={styles.modeDescription}>
            Keys start with{" "}
            <Text as="span" className={styles.prefix} color="default1">
              pk_live
            </Text>{" "}
            /{" "}
            <Text as="span" className={styles.prefix} color="default1">
              rk_live
            </Text>
            . Real money — production only.
          </Text>
        </Box>
      </Box>
    </Box>
  </AsideInfoCard>
);
