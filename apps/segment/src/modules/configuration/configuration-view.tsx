import { zodResolver } from "@hookform/resolvers/zod";
import { TextLink } from "@saleor/apps-ui";
import {
  AppPageHeader,
  AsideInfoCard,
  Callout,
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
  StatusLabel,
} from "@saleor/apps-ui-next";
import { Box, Text, useTheme } from "@saleor/macaw-ui";
import { Input } from "@saleor/react-hook-form-macaw";
import clsx from "clsx";
import { BookOpen, ShoppingCart, Waypoints } from "lucide-react";
import { type ReactNode } from "react";
import { useForm } from "react-hook-form";

import styles from "./configuration-view.module.css";
import { RootConfig } from "./schemas/root-config.schema";

const FORM_ID = "segment-configuration";

const DOCS_URL = "https://docs.saleor.io/developer/app-store/apps/segment/overview";
const SEGMENT_WRITE_KEY_DOCS_URL = "https://segment.com/docs/connections/find-writekey/";
const SEGMENT_DESTINATIONS_DOCS_URL = "https://segment.com/docs/connections/destinations/";
const SEGMENT_ECOMMERCE_SPEC_URL = "https://segment.com/docs/connections/spec/ecommerce/v2/";

/** What the app tracks today — mirrors the webhook handlers, not configurable. */
const trackedEvents = [
  {
    saleorEvent: "Order confirmed",
    description: "The order is confirmed and ready to be fulfilled.",
    segmentEvent: "Saleor Order Completed",
  },
  {
    saleorEvent: "Order updated",
    description: "Lines, addresses or status of the order change.",
    segmentEvent: "Saleor Order Updated",
  },
  {
    saleorEvent: "Order cancelled",
    description: "The order is cancelled.",
    segmentEvent: "Saleor Order Cancelled",
  },
  {
    saleorEvent: "Order refunded",
    description: "Money is returned to the customer.",
    segmentEvent: "Saleor Order Refunded",
  },
];

const openInNewTab = (url: string) => window.open(url, "_blank", "noopener,noreferrer");

const SegmentLegend = () => (
  <AsideInfoCard
    title="How events reach Segment"
    fold={{
      title: "Find your write key",
      children: (
        <Box>
          <ol className={styles.steps}>
            <li>
              <Text size={2} color="default2">
                In Segment, open{" "}
                <Text as="span" size={2} fontWeight="medium" color="default1">
                  Connections → Sources
                </Text>{" "}
                and pick the source for your store, or add a{" "}
                <Text as="span" size={2} fontWeight="medium" color="default1">
                  Node.js
                </Text>{" "}
                source.
              </Text>
            </li>
            <li>
              <Text size={2} color="default2">
                Go to{" "}
                <Text as="span" size={2} fontWeight="medium" color="default1">
                  Settings → API Keys
                </Text>{" "}
                and copy the{" "}
                <Text as="span" size={2} fontWeight="medium" color="default1">
                  Write Key
                </Text>
                .
              </Text>
            </li>
          </ol>
          <Box className={styles.links}>
            <TextLink href={SEGMENT_WRITE_KEY_DOCS_URL} newTab size={1}>
              Locating your write key
            </TextLink>
            <TextLink href={SEGMENT_ECOMMERCE_SPEC_URL} newTab size={1}>
              Segment e-commerce spec
            </TextLink>
          </Box>
        </Box>
      ),
    }}
  >
    <ol className={styles.flow}>
      {[
        "An order changes in Saleor, for example it is confirmed or refunded.",
        "The app sends it to your Segment source as a track event, with the customer.",
        "Segment forwards it to the destinations you connected — analytics, CRM, ads.",
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
      title="Finish Segment setup"
      progress={{ done: 0, total: 1 }}
      tasksSection={{ title: "Required" }}
      tasks={[
        {
          id: "write-key",
          title: "Connect your Segment source",
          description: "Paste the source write key below and save",
          status: "active",
          details:
            "Until a write key is saved, the app does not send anything to Segment. Saving also turns on the app's webhooks in Saleor.",
        },
      ]}
      reviewSection={{
        title: "Next in Segment",
        items: [
          {
            id: "destinations",
            icon: <Waypoints size={iconSize.small} />,
            title: "Connect destinations",
            description: "Forward Saleor order events to your analytics and marketing tools.",
            onClick: () => openInNewTab(SEGMENT_DESTINATIONS_DOCS_URL),
          },
          {
            id: "docs",
            icon: <BookOpen size={iconSize.small} />,
            title: "Read the app docs",
            description: "Which order fields each event carries.",
            onClick: () => openInNewTab(DOCS_URL),
          },
        ],
      }}
      nextUp="Next up: Connect your Segment source"
    />
  );
};

const FieldSkeleton = () => (
  <SettingsFieldStack>
    <Skeleton display="block" __height="2.5rem" __width="100%" borderRadius={2} />
  </SettingsFieldStack>
);

type Props = {
  /** `undefined` while loading; empty string when nothing is saved yet. */
  writeKey: string | undefined;
  /** `undefined` while loading. */
  webhooksActive: boolean | undefined;
  /** Replaces the page body, e.g. when the user lacks permissions. */
  fallback?: ReactNode;
  saveState: ConfirmButtonTransitionState;
  onSave: (writeKey: string) => void;
};

export const ConfigurationView = ({
  writeKey,
  webhooksActive,
  fallback,
  saveState,
  onSave,
}: Props) => {
  const {
    control,
    handleSubmit,
    formState: { isDirty },
  } = useForm<RootConfig.Shape>({
    resolver: zodResolver(RootConfig.Schema),
    /* Follows the saved key, so a refetch after saving resets the form to clean. */
    values: writeKey === undefined ? undefined : { segmentWriteKey: writeKey },
  });

  const hasSavedKey = Boolean(writeKey);

  return (
    <DetailPageLayout withSavebar={!fallback}>
      <AppPageHeader
        title="Segment"
        actions={
          <TextLink href={DOCS_URL} newTab size={2}>
            Documentation
          </TextLink>
        }
      />
      <DetailPageLayout.Content>
        <SettingsPageContent
          description="Send order events to Twilio Segment, so you can forward them to your analytics and marketing tools."
          aside={<SegmentLegend />}
        >
          {fallback ?? (
            <form id={FORM_ID} onSubmit={handleSubmit((values) => onSave(values.segmentWriteKey))}>
              <Box display="flex" flexDirection="column" gap={6}>
                {writeKey === "" ? <ConnectChecklist /> : null}

                <SettingsSection
                  title="Segment source"
                  ownership="shop"
                  description="One Segment source receives events from every channel."
                  headerEnd={
                    hasSavedKey && webhooksActive !== undefined ? (
                      webhooksActive ? (
                        <StatusLabel tone="success">Sending events</StatusLabel>
                      ) : (
                        <StatusLabel tone="error">Not sending</StatusLabel>
                      )
                    ) : null
                  }
                >
                  {writeKey === undefined ? (
                    <FieldSkeleton />
                  ) : (
                    <SettingsFieldStack>
                      {hasSavedKey && webhooksActive === false ? (
                        <Callout type="error" title="Saleor turned off the app's webhooks">
                          Most likely the write key is invalid. Save a valid key to turn them back
                          on.
                        </Callout>
                      ) : null}
                      <Input
                        control={control}
                        name="segmentWriteKey"
                        type="password"
                        label="Write key"
                        helperText="Find it in Segment under Connections → Sources → your source → Settings → API Keys."
                      />
                    </SettingsFieldStack>
                  )}
                </SettingsSection>

                <SettingsSection
                  title="Events"
                  ownership="shop"
                  description="Order changes the app sends to Segment, and the event name they arrive under. Names follow the Segment e-commerce spec with a Saleor prefix."
                >
                  <Box className={styles.list}>
                    <ListSubheader
                      icon={
                        <ShoppingCart
                          size={iconSize.small}
                          strokeWidth={iconStrokeWidthBySize.small}
                        />
                      }
                    >
                      Orders
                    </ListSubheader>
                    {trackedEvents.map((event) => (
                      <Box key={event.segmentEvent} className={styles.row}>
                        <Box className={styles.label}>
                          <Text size={3}>{event.saleorEvent}</Text>
                          <Text size={1} color="default2">
                            {event.description}
                          </Text>
                        </Box>
                        <span className={styles.eventName}>{event.segmentEvent}</span>
                      </Box>
                    ))}
                  </Box>
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
