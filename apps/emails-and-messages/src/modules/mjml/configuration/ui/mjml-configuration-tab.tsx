import React from "react";
import { IconButton, makeStyles } from "@saleor/macaw-ui";
import { actions, useAppBridge } from "@saleor/app-sdk/app-bridge";
import { AppColumnsLayout } from "../../../ui/app-columns-layout";
import { trpcClient } from "../../../trpc/trpc-client";
import { MjmlConfigurationForm } from "./mjml-configuration-form";
import { getDefaultEmptyConfiguration } from "../mjml-config-container";
import { NextRouter, useRouter } from "next/router";
import { mjmlUrls } from "../../urls";
import { MjmlTemplatesCard } from "./mjml-templates-card";
import SideMenu from "../../../app-configuration/ui/side-menu";
import { MjmlConfiguration } from "../mjml-config";
import { LoadingIndicator } from "../../../ui/loading-indicator";
import { Add } from "@material-ui/icons";

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
  const { appBridge } = useAppBridge();
  const router = useRouter();

  const {
    data: configurations,
    refetch: refetchConfigurations,
    isLoading: configurationsIsLoading,
  } = trpcClient.mjmlConfiguration.getConfigurations.useQuery(
    {},
    {
      onSuccess(data) {
        if (!configurationId) {
          navigateToFirstConfiguration(router, data);
        }
      },
    }
  );

  const { mutate: deleteConfiguration, error: deleteError } =
    trpcClient.mjmlConfiguration.deleteConfiguration.useMutation({
      onSuccess(data, variables) {
        refetchConfigurations();
        // if we just deleted the configuration that was selected
        // we have to navigate to the first configuration
        if (variables.id === configurationId) {
          navigateToFirstConfiguration(router, configurations);
        }
        appBridge?.dispatch(
          actions.Notification({
            title: "Success",
            text: "Removed successfully",
            status: "success",
          })
        );
      },
    });

  if (configurationsIsLoading) {
    return <LoadingIndicator />;
  }

  const configuration = configurations?.find((c) => c.id === configurationId?.toString());

  if (configurationId && !configuration) {
    return <div>Configuration not found</div>;
  }

  return (
    <AppColumnsLayout>
      <SideMenu
        title="Configurations"
        selectedItemId={configurationId}
        headerToolbar={
          <IconButton
            variant="secondary"
            onClick={() => {
              router.replace(mjmlUrls.configuration());
            }}
          >
            <Add />
          </IconButton>
        }
        onClick={(id) => router.replace(mjmlUrls.configuration(id))}
        onDelete={(id) => {
          deleteConfiguration({ id });
        }}
        items={configurations?.map((c) => ({ label: c.configurationName, id: c.id })) || []}
      />
      <div className={styles.configurationColumn}>
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
      </div>
    </AppColumnsLayout>
  );
};
