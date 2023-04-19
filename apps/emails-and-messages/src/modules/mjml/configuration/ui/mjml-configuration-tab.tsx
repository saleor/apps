import React from "react";
import { makeStyles } from "@saleor/macaw-ui";
import { AppColumnsLayout } from "../../../ui/app-columns-layout";
import { trpcClient } from "../../../trpc/trpc-client";
import { MjmlConfigurationForm } from "./mjml-configuration-form";
import { getDefaultEmptyConfiguration } from "../mjml-config-container";
import { NextRouter, useRouter } from "next/router";
import { mjmlUrls } from "../../urls";
import { MjmlTemplatesCard } from "./mjml-templates-card";
import { MjmlConfiguration } from "../mjml-config";
import { LoadingIndicator } from "../../../ui/loading-indicator";
import { MjmlInstructions } from "./mjml-instructions";
import { useDashboardNotification } from "@saleor/apps-shared";

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
      maxWidth: 600,
    },
  };
});

interface MjmlConfigurationTabProps {
  configurationId?: string;
}

const navigateToFirstConfiguration = (router: NextRouter, configurations?: MjmlConfiguration[]) => {
  if (!configurations || !configurations?.length) {
    router.replace(mjmlUrls.configuration());
    return;
  }
  const firstConfigurationId = configurations[0]?.id;

  if (firstConfigurationId) {
    router.replace(mjmlUrls.configuration(firstConfigurationId));
    return;
  }
};

export const MjmlConfigurationTab = ({ configurationId }: MjmlConfigurationTabProps) => {
  const styles = useStyles();
  const router = useRouter();

  const {
    data: configurations,
    refetch: refetchConfigurations,
    isLoading: configurationsIsLoading,
    isFetching: configurationsIsFetching,
  } = trpcClient.mjmlConfiguration.getConfigurations.useQuery(undefined, {
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
            <MjmlConfigurationForm
              onConfigurationSaved={() => refetchConfigurations()}
              initialData={configuration || getDefaultEmptyConfiguration()}
              configurationId={configurationId}
            />
            {!!configurationId && !!configuration && (
              <MjmlTemplatesCard
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
      <MjmlInstructions />
    </AppColumnsLayout>
  );
};
