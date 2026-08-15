import { TextLink } from "@saleor/apps-ui";
import { SettingsFieldStack, SettingsSection } from "@saleor/apps-ui-next";
import { Button, Skeleton, Text } from "@saleor/macaw-ui";
import { useRouter } from "next/router";
import { type ReactNode, useEffect } from "react";

import { trpcClient } from "@/modules/trpc/trpc-client";
import { StripeConfigsList } from "@/modules/ui/stripe-configs/stripe-configs-list";

/** Keeps title / ownership / test id identical across loading, error and data states. */
const Section = ({
  description,
  headerEnd,
  children,
}: {
  description?: ReactNode;
  headerEnd?: ReactNode;
  children: ReactNode;
}) => (
  <SettingsSection
    title="Stripe configurations"
    ownership="channel"
    description={description}
    headerEnd={headerEnd}
    data-test-id="stripe-configurations-card"
  >
    {children}
  </SettingsSection>
);

export const ChannelConfigSection = () => {
  const configsQuery = trpcClient.appConfig.getStripeConfigsList.useQuery();
  const channelsQuery = trpcClient.appConfig.fetchChannels.useQuery();
  const mappingQuery = trpcClient.appConfig.channelsConfigsMapping.useQuery();
  const router = useRouter();

  /*
   * Queries opt out of `refetchOnMount` globally (see trpc-client), so returning from
   * /config/new would otherwise render stale data. Refetch once per mount.
   */
  useEffect(() => {
    void configsQuery.refetch();
    void channelsQuery.refetch();
    void mappingQuery.refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const description = (
    <>
      Create configurations (sandbox or live), then assign which Saleor channels use each one.
      Checkout uses the configuration mapped to that channel. See the{" "}
      <TextLink href="https://docs.saleor.io/developer/app-store/apps/stripe/configuration" newTab>
        configuration docs
      </TextLink>
      .
    </>
  );

  const goToNewConfig = () => router.push("/config/new");

  /** Section header — secondary so it doesn’t compete with card assign/save. */
  const addButtonSecondary = (
    <Button variant="secondary" size="small" onClick={goToNewConfig}>
      Add configuration
    </Button>
  );

  /** Empty state — primary first-run CTA. */
  const addButtonPrimary = (
    <Button variant="primary" size="small" onClick={goToNewConfig}>
      Add configuration
    </Button>
  );

  const errors = [configsQuery.error, channelsQuery.error, mappingQuery.error].filter(Boolean);
  const sessionExpired = errors.some((e) => e?.data?.code === "FORBIDDEN");
  const anythingLoading =
    configsQuery.isLoading || channelsQuery.isLoading || mappingQuery.isLoading;

  if (sessionExpired) {
    return (
      <Section>
        <SettingsFieldStack>
          <Text size={3} color="default2">
            Your dashboard session is no longer valid. Please refresh the page or reopen the app
            from Saleor Dashboard.
          </Text>
        </SettingsFieldStack>
      </Section>
    );
  }

  if (errors.length > 0) {
    return (
      <Section>
        <SettingsFieldStack>
          <Text color="critical1">Error fetching config: {errors[0]?.message}</Text>
        </SettingsFieldStack>
      </Section>
    );
  }

  if (anythingLoading) {
    return (
      <Section>
        <SettingsFieldStack>
          <Skeleton />
        </SettingsFieldStack>
      </Section>
    );
  }

  if (configsQuery.data && configsQuery.data.length === 0) {
    return (
      <Section description={description} headerEnd={addButtonPrimary}>
        <SettingsFieldStack>
          <Text size={3} color="default2">
            No configurations found. Create your first configuration to get started.
          </Text>
        </SettingsFieldStack>
      </Section>
    );
  }

  if (configsQuery.data && channelsQuery.data && mappingQuery.data) {
    return (
      <Section description={description} headerEnd={addButtonSecondary}>
        {/* List owns padded grid + full-bleed unassigned fold (SettingsSection body siblings). */}
        <StripeConfigsList
          configs={configsQuery.data}
          channels={channelsQuery.data}
          mapping={mappingQuery.data}
        />
      </Section>
    );
  }

  return (
    <Section>
      <SettingsFieldStack>
        <Skeleton />
      </SettingsFieldStack>
    </Section>
  );
};
