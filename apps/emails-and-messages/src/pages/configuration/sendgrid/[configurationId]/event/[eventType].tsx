import { NextPage } from "next";
import React from "react";
import { useRouter } from "next/router";
import { trpcClient } from "../../../../../modules/trpc/trpc-client";

import { parseMessageEventType } from "../../../../../modules/event-handlers/parse-message-event-type";
import { ConfigurationPageBaseLayout } from "../../../../../modules/ui/configuration-page-base-layout";
import { LoadingIndicator } from "../../../../../modules/ui/loading-indicator";
import { EventConfigurationForm } from "../../../../../modules/sendgrid/configuration/ui/sendgrid-event-configuration-form";

const EventConfigurationPage: NextPage = () => {
  const router = useRouter();

  const configurationId = router.query.configurationId as string;
  const eventTypeFromQuery = router.query.eventType as string | undefined;
  const eventType = parseMessageEventType(eventTypeFromQuery);

  const {
    data: eventConfiguration,
    isError,
    isFetched,
    isLoading,
  } = trpcClient.sendgridConfiguration.getEventConfiguration.useQuery(
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

  const { data: configuration } = trpcClient.sendgridConfiguration.getConfiguration.useQuery(
    {
      id: configurationId,
    },
    {
      enabled: !!configurationId,
    }
  );

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
  if (!eventConfiguration || !configuration) {
    return <>Error: no configuration with given id</>;
  }
  return (
    <ConfigurationPageBaseLayout>
      <EventConfigurationForm
        initialData={eventConfiguration}
        configurationId={configurationId}
        configuration={configuration}
        eventType={eventType}
      />
    </ConfigurationPageBaseLayout>
  );
};

export default EventConfigurationPage;
