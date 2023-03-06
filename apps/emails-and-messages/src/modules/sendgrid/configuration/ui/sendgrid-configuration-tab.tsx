import { CircularProgress, Paper } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { makeStyles } from "@saleor/macaw-ui";
import { ConfigurationsList } from "../../../app-configuration/ui/configurations-list";
import { actions, useAppBridge } from "@saleor/app-sdk/app-bridge";
import { AppColumnsLayout } from "../../../ui/app-columns-layout";
import { trpcClient } from "../../../trpc/trpc-client";
import { SendgridConfiguration } from "../sendgrid-config";
import {
  getDefaultEmptySendgridConfiguration,
  SendgridConfigContainer,
} from "../sendgrid-config-container";
import { SendgridConfigurationForm } from "./sendgrid-configuration-form";

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
    loaderContainer: {
      margin: "50px auto",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
  };
});

type Configurations = {
  name: string;
  id: string;
};

export const SendgridConfigurationTab = () => {
  const styles = useStyles();
  const { appBridge } = useAppBridge();
  const [configurationsListData, setConfigurationsListData] = useState<Configurations[]>([]);
  const [activeConfigurationId, setActiveConfigurationId] = useState<string>();
  const [initialData, setInitialData] = useState<SendgridConfiguration>();

  const {
    data: configurationData,
    refetch: refetchConfig,
    isLoading,
  } = trpcClient.sendgridConfiguration.fetch.useQuery(undefined, {
    onSuccess(data) {
      if (!data.availableConfigurations) {
        return;
      }
      const keys = Object.keys(data.availableConfigurations);
      setConfigurationsListData(
        keys.map((key) => ({ id: key, name: data.availableConfigurations[key].configurationName }))
      );
      setActiveConfigurationId(keys[0]);
    },
  });

  const { mutate, error: saveError } = trpcClient.sendgridConfiguration.setAndReplace.useMutation({
    onSuccess() {
      refetchConfig();
      appBridge?.dispatch(
        actions.Notification({
          title: "Success",
          text: "Saved configuration",
          status: "success",
        })
      );
    },
  });

  useEffect(() => {
    setInitialData(
      activeConfigurationId
        ? SendgridConfigContainer.getSendgridConfigurationById(configurationData)(
            activeConfigurationId
          )
        : getDefaultEmptySendgridConfiguration()
    );
  }, [activeConfigurationId, configurationData]);

  if (isLoading) {
    return (
      <div className={styles.loaderContainer}>
        <CircularProgress color="primary" />
      </div>
    );
  }

  return (
    <AppColumnsLayout>
      <ConfigurationsList
        // TODO: FIXME
        listItems={[]}
        activeItemId={activeConfigurationId}
        onItemClick={setActiveConfigurationId}
      />
      <div className={styles.configurationColumn}>
        <Paper elevation={0} className={styles.formContainer}>
          {!!initialData && (
            <SendgridConfigurationForm
              onSubmit={async (data) => {
                const newConfig =
                  SendgridConfigContainer.setSendgridConfigurationById(configurationData)(
                    activeConfigurationId
                  )(data);
                mutate(newConfig);
              }}
              initialData={initialData}
              configurationId={activeConfigurationId}
            />
          )}
          {saveError && <span>{saveError.message}</span>}
        </Paper>
      </div>
    </AppColumnsLayout>
  );
};
