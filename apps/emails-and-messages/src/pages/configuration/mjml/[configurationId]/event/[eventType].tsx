import { NextPage } from "next";
import React from "react";
import { useRouter } from "next/router";
import { trpcClient } from "../../../../../modules/trpc/trpc-client";

import { checkMessageEventType } from "../../../../../modules/event-handlers/check-message-event-type";
import { ConfigurationPageBaseLayout } from "../../../../../modules/ui/configuration-page-base-layout";
import { EventConfigurationForm } from "../../../../../modules/mjml/configuration/ui/mjml-event-configuration-form";
import { LoadingIndicator } from "../../../../../modules/ui/loading-indicator";

const EventConfigurationPage: NextPage = () => {
  const router = useRouter();

  const configurationId = router.query.configurationId as string;
  const eventTypeFromQuery = router.query.eventType as string | undefined;
  const eventType = checkMessageEventType(eventTypeFromQuery);

  const {
    data: configuration,
    isError,
    isFetched,
    isLoading,
    error,
  } = trpcClient.mjmlConfiguration.getEventConfiguration.useQuery(
    {
      configurationId,
      // if event type is not valid, it calling the query will not be enabled
      // so we can safely cast it
      eventType: eventType!,
    },
    {
      enabled: !!configurationId && !!eventType,
    }
  );

  // TODO: better error messages
  if (!eventType || !configurationId) {
    return <>Error: no event type or configuration id</>;
  }
  if (isLoading) {
    return (
      <ConfigurationPageBaseLayout>
        <LoadingIndicator />
      </ConfigurationPageBaseLayout>
    );
  }

  if (isError) {
    return (
      <>
        Error: could not load the config: fetched: {isFetched} is error {isError}
      </>
    );
  }
  if (!configuration) {
    return <>Error: no configuration with given id</>;
  }
  return (
    <ConfigurationPageBaseLayout>
      <EventConfigurationForm
        initialData={configuration}
        configurationId={configurationId}
        eventType={eventType}
      />
    </ConfigurationPageBaseLayout>
  );
};

export default EventConfigurationPage;
