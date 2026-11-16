import { TextLink } from "@saleor/apps-ui";
import {
  AppPageHeader,
  AsideInfoCard,
  type ConfirmButtonTransitionState,
  DetailPageLayout,
  iconSize,
  iconStrokeWidthBySize,
  ListSubheader,
  Savebar,
  SettingsFieldStack,
  SettingsPageContent,
  SettingsSection,
  SetupChecklist,
  setupChecklistStyles,
  Skeleton,
} from "@saleor/apps-ui-next";
import { Box, Input, Text, useTheme } from "@saleor/macaw-ui";
import clsx from "clsx";
import { BookOpen, ShoppingCart, User, Workflow } from "lucide-react";
import { Fragment, type ReactNode, useState } from "react";

import styles from "./configuration-view.module.css";

export type ConfigurationKey =
  | "PUBLIC_TOKEN"
  | "CUSTOMER_CREATED_METRIC"
  | "ORDER_CREATED_METRIC"
  | "ORDER_FULLY_PAID_METRIC"
  | "FULFILLMENT_CREATED_METRIC";

export type ConfigurationValues = Record<ConfigurationKey, string>;

const FORM_ID = "klaviyo-configuration";

const DOCS_URL = "https://docs.saleor.io/developer/app-store/apps/klaviyo";
const KLAVIYO_API_KEYS_URL = "https://www.klaviyo.com/settings/account/api-keys";
const KLAVIYO_API_KEYS_HELP_URL =
  "https://help.klaviyo.com/hc/en-us/articles/115005062267-How-to-Manage-Your-Account-s-API-Keys";
const KLAVIYO_METRICS_HELP_URL =
  "https://help.klaviyo.com/hc/en-us/articles/115005076787-Guide-to-Managing-Your-Metrics";
const KLAVIYO_FLOWS_HELP_URL = "https://help.klaviyo.com/hc/en-us/articles/115002774932";

const eventGroups = [
  {
    id: "customers",
    title: "Customers",
    icon: User,
    events: [
      {
        key: "CUSTOMER_CREATED_METRIC",
        label: "Customer created",
        description: "A shopper registers an account.",
      },
    ],
  },
  {
    id: "orders",
    title: "Orders",
    icon: ShoppingCart,
    events: [
      {
        key: "ORDER_CREATED_METRIC",
        label: "Order created",
        description: "An order is placed, before payment completes.",
      },
      {
        key: "ORDER_FULLY_PAID_METRIC",
        label: "Order fully paid",
        description: "The order total has been captured.",
      },
      {
        key: "FULFILLMENT_CREATED_METRIC",
        label: "Fulfillment created",
        description: "Items of an order are packed and shipped.",
      },
    ],
  },
] as const;

const openInNewTab = (url: string) => window.open(url, "_blank", "noopener,noreferrer");

const KlaviyoLegend = () => (
  <AsideInfoCard
    title="How events reach Klaviyo"
    fold={{
      title: "Find your public API key",
      children: (
        <Box>
          <ol className={styles.steps}>
            <li>
              <Text size={2} color="default2">
                In Klaviyo, open{" "}
                <Text as="span" size={2} fontWeight="medium" color="default1">
                  Settings → Account → API keys
                </Text>
                .
              </Text>
            </li>
            <li>
              <Text size={2} color="default2">
                Copy the{" "}
                <Text as="span" size={2} fontWeight="medium" color="default1">
                  Public API key
                </Text>{" "}
                (also called Site ID). Do not use a private key.
              </Text>
            </li>
          </ol>
          <Box className={styles.links}>
            <TextLink href={KLAVIYO_API_KEYS_URL} newTab size={1}>
              Open Klaviyo API keys
            </TextLink>
            <TextLink href={KLAVIYO_API_KEYS_HELP_URL} newTab size={1}>
              About Klaviyo API keys
            </TextLink>
            <TextLink href={KLAVIYO_METRICS_HELP_URL} newTab size={1}>
              About Klaviyo metrics
            </TextLink>
          </Box>
        </Box>
      ),
    }}
  >
    <ol className={styles.flow}>
      {[
        "Something happens in Saleor, for example an order is placed.",
        "The app sends it to Klaviyo as a metric, together with the customer email.",
        "Once the first event arrives, build flows and segments on that metric in Klaviyo.",
      ].map((step, index) => (
        <li key={step} className={styles.flowStep}>
          <span className={styles.flowNumber}>{index + 1}</span>
          <Text size={2} color="default2">
            {step}
          </Text>
        </li>
      ))}
    </ol>
  </AsideInfoCard>
);

const ConnectChecklist = () => {
  const { theme } = useTheme();

  return (
    <SetupChecklist
      className={clsx(
        setupChecklistStyles.elevated,
        theme === "defaultDark" && setupChecklistStyles.elevatedDark,
      )}
      title="Finish Klaviyo setup"
      progress={{ done: 0, total: 1 }}
      tasksSection={{ title: "Required" }}
      tasks={[
        {
          id: "public-key",
          title: "Connect your Klaviyo account",
          description: "Paste the public API key below and save",
          status: "active",
          details:
            "Until a key is saved, the app does not send anything to Klaviyo. Find the key in Klaviyo under Settings → Account → API keys.",
        },
      ]}
      reviewSection={{
        title: "Next in Klaviyo",
        items: [
          {
            id: "flows",
            icon: <Workflow size={iconSize.small} />,
            title: "Build a flow on a Saleor metric",
            description: "For example a welcome or post-purchase flow.",
            onClick: () => openInNewTab(KLAVIYO_FLOWS_HELP_URL),
          },
          {
            id: "docs",
            icon: <BookOpen size={iconSize.small} />,
            title: "Read the app docs",
            description: "What each event sends to Klaviyo.",
            onClick: () => openInNewTab(DOCS_URL),
          },
        ],
      }}
      nextUp="Next up: Connect your Klaviyo account"
    />
  );
};

const FieldsSkeleton = ({ rows }: { rows: number }) => (
  <SettingsFieldStack>
    {Array.from({ length: rows }, (_, index) => (
      <Skeleton key={index} display="block" __height="2.5rem" __width="100%" borderRadius={2} />
    ))}
  </SettingsFieldStack>
);

type Props = {
  /** `undefined` while loading. */
  values: ConfigurationValues | undefined;
  /** Replaces the page body, e.g. when the app API cannot be reached. */
  fallback?: ReactNode;
  saveState: ConfirmButtonTransitionState;
  onSave: (values: ConfigurationValues) => void;
};

/**
 * One form for the whole page: the account key and the metric name of every event, saved together
 * from the save bar.
 */
export const ConfigurationView = ({ values, fallback, saveState, onSave }: Props) => {
  /* Unset until the first edit, so the form follows `values` while it loads and after a save. */
  const [draft, setDraft] = useState<ConfigurationValues>();
  const current = draft ?? values;
  const isDirty =
    values !== undefined &&
    current !== undefined &&
    (Object.keys(values) as ConfigurationKey[]).some((key) => values[key] !== current[key]);

  const update = (key: ConfigurationKey, value: string) => {
    if (!current) return;

    setDraft({ ...current, [key]: value });
  };

  const hasSavedKey = Boolean(values?.PUBLIC_TOKEN);

  return (
    <DetailPageLayout withSavebar={!fallback}>
      <AppPageHeader
        title="Klaviyo"
        actions={
          <TextLink href={DOCS_URL} newTab size={2}>
            Documentation
          </TextLink>
        }
      />
      <DetailPageLayout.Content>
        <SettingsPageContent
          description="Send store events to Klaviyo as metrics, so you can trigger flows and build segments on them."
          aside={<KlaviyoLegend />}
        >
          {fallback ?? (
            <form
              id={FORM_ID}
              onSubmit={(event) => {
                event.preventDefault();
                if (current) onSave(current);
              }}
            >
              <Box display="flex" flexDirection="column" gap={6}>
                {values && !hasSavedKey ? <ConnectChecklist /> : null}

                <SettingsSection
                  title="Klaviyo account"
                  ownership="shop"
                  description="One Klaviyo account receives events from every channel."
                >
                  {current ? (
                    <SettingsFieldStack>
                      <Input
                        label="Public API key"
                        name="PUBLIC_TOKEN"
                        value={current.PUBLIC_TOKEN}
                        onChange={(event) => update("PUBLIC_TOKEN", event.target.value)}
                        helperText="Also called Site ID. Find it in Klaviyo under Settings → Account → API keys."
                      />
                    </SettingsFieldStack>
                  ) : (
                    <FieldsSkeleton rows={1} />
                  )}
                </SettingsSection>

                <SettingsSection
                  title="Events"
                  ownership="shop"
                  description="Each Saleor event is sent to Klaviyo under the metric name you set here. Renaming a metric starts a new one in Klaviyo — flows built on the old name stop receiving events."
                >
                  {current ? (
                    <Box className={styles.list}>
                      {eventGroups.map((group) => {
                        const Icon = group.icon;

                        return (
                          <Fragment key={group.id}>
                            <ListSubheader
                              icon={
                                <Icon
                                  size={iconSize.small}
                                  strokeWidth={iconStrokeWidthBySize.small}
                                />
                              }
                            >
                              {group.title}
                            </ListSubheader>
                            {group.events.map((event) => (
                              <Box key={event.key} className={styles.row}>
                                <Box className={styles.label}>
                                  <Text size={3}>{event.label}</Text>
                                  <Text size={1} color="default2">
                                    {event.description}
                                  </Text>
                                </Box>
                                <Input
                                  size="small"
                                  label="Klaviyo metric name"
                                  name={event.key}
                                  value={current[event.key]}
                                  onChange={(e) => update(event.key, e.target.value)}
                                />
                              </Box>
                            ))}
                          </Fragment>
                        );
                      })}
                    </Box>
                  ) : (
                    <FieldsSkeleton rows={4} />
                  )}
                </SettingsSection>
              </Box>
            </form>
          )}
        </SettingsPageContent>
      </DetailPageLayout.Content>
      {fallback ? null : (
        <Savebar>
          <Savebar.Spacer />
          <Savebar.ConfirmButton
            form={FORM_ID}
            disabled={!isDirty || saveState === "loading"}
            transitionState={saveState}
          >
            Save
          </Savebar.ConfirmButton>
        </Savebar>
      )}
    </DetailPageLayout>
  );
};
