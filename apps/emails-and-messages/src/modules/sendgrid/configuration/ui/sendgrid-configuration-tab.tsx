import React from "react";
import { makeStyles } from "@saleor/macaw-ui";
import { AppColumnsLayout } from "../../../ui/app-columns-layout";
import { trpcClient } from "../../../trpc/trpc-client";
import { SendgridConfigurationForm } from "./sendgrid-configuration-form";
import { getDefaultEmptyConfiguration } from "../sendgrid-config-container";
import { NextRouter, useRouter } from "next/router";
import { SendgridConfiguration } from "../sendgrid-config";
import { LoadingIndicator } from "../../../ui/loading-indicator";
import { sendgridUrls } from "../../urls";
import { SendgridTemplatesCard } from "./sendgrid-templates-card";
import { SendgridInstructions } from "./sendgrid-instructions";

const useStyles = makeStyles((theme) => {
  return {
    formContainer: {
      top: 0,
    },
    instructionsContainer: {
      padding: 15,
    },
    configurationColumn: {
      display: "flex",
      flexDirection: "column",
      gap: 20,
      maxWidth: 700,
    },
  };
});

interface SendgridConfigurationTabProps {
  configurationId?: string;
}

const navigateToFirstConfiguration = (
  router: NextRouter,
  configurations?: SendgridConfiguration[]
) => {
  if (!configurations || !configurations?.length) {
    router.replace(sendgridUrls.configuration());
    return;
  }
  const firstConfigurationId = configurations[0]?.id;

  if (firstConfigurationId) {
    router.replace(sendgridUrls.configuration(firstConfigurationId));
    return;
  }
};

export const SendgridConfigurationTab = ({ configurationId }: SendgridConfigurationTabProps) => {
  const styles = useStyles();
  const router = useRouter();

  const {
    data: configurations,
    refetch: refetchConfigurations,
    isLoading: configurationsIsLoading,
    isFetching: configurationsIsFetching,
  } = trpcClient.sendgridConfiguration.getConfigurations.useQuery(undefined, {
    onSuccess(data) {
      if (!configurationId) {
        console.log("no conf id! navigate to first");
        navigateToFirstConfiguration(router, data);
      }
    },
  });

  if (configurationsIsLoading || configurationsIsFetching) {
    return <LoadingIndicator />;
  }

  const configuration = configurations?.find((c) => c.id === configurationId?.toString());

  if (configurationId && !configuration) {
    return <div>Configuration not found</div>;
  }

  return (
    <AppColumnsLayout>
      <div className={styles.configurationColumn}>
        {configurationsIsLoading || configurationsIsFetching ? (
          <LoadingIndicator />
        ) : (
          <>
            <SendgridConfigurationForm
              onConfigurationSaved={() => refetchConfigurations()}
              initialData={configuration || getDefaultEmptyConfiguration()}
              configurationId={configurationId}
            />
            {!!configurationId && !!configuration && (
              <SendgridTemplatesCard
                configurationId={configurationId}
                configuration={configuration}
                onEventChanged={() => {
                  refetchConfigurations();
                }}
              />
            )}
          </>
        )}
      </div>
      <SendgridInstructions />
    </AppColumnsLayout>
  );
};
