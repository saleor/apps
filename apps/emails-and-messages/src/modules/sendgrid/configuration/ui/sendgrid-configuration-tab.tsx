import React from "react";
import { IconButton, makeStyles } from "@saleor/macaw-ui";
import { AppColumnsLayout } from "../../../ui/app-columns-layout";
import { trpcClient } from "../../../trpc/trpc-client";
import { SendgridConfigurationForm } from "./sendgrid-configuration-form";
import { getDefaultEmptyConfiguration } from "../sendgrid-config-container";
import { NextRouter, useRouter } from "next/router";
import { SideMenu } from "../../../app-configuration/ui/side-menu";
import { SendgridConfiguration } from "../sendgrid-config";
import { LoadingIndicator } from "../../../ui/loading-indicator";
import { Add } from "@material-ui/icons";
import { useQueryClient } from "@tanstack/react-query";
import { sendgridUrls } from "../../urls";
import { SendgridTemplatesCard } from "./sendgrid-templates-card";
import { SendgridInstructions } from "./sendgrid-instructions";
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
  const queryClient = useQueryClient();
  const { notifySuccess, notifyError } = useDashboardNotification();

  const {
    data: configurations,
    refetch: refetchConfigurations,
    isLoading: configurationsIsLoading,
    isFetching: configurationsIsFetching,
    isRefetching: configurationsIsRefetching,
  } = trpcClient.sendgridConfiguration.getConfigurations.useQuery(undefined, {
    onSuccess(data) {
      if (!configurationId) {
        console.log("no conf id! navigate to first");
        navigateToFirstConfiguration(router, data);
      }
    },
  });

  const { mutate: deleteConfiguration } =
    trpcClient.sendgridConfiguration.deleteConfiguration.useMutation({
      onError: (error) => {
        notifyError("Could not remove the configuration", error.message);
      },
      onSuccess: async (_data, variables) => {
        await queryClient.cancelQueries({
          queryKey: ["sendgridConfiguration", "getConfigurations"],
        });
        // remove value from the cache after the success
        queryClient.setQueryData<Array<SendgridConfiguration>>(
          ["sendgridConfiguration", "getConfigurations"],
          (old) => {
            if (old) {
              const index = old.findIndex((c) => c.id === variables.id);
              if (index !== -1) {
                delete old[index];
                return [...old];
              }
            }
          }
        );

        // if we just deleted the configuration that was selected
        // we have to update the URL
        if (variables.id === configurationId) {
          router.replace(sendgridUrls.configuration());
        }

        refetchConfigurations();

        notifySuccess("Success", "Removed successfully");
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
      <SideMenu
        title="Configurations"
        selectedItemId={configurationId}
        headerToolbar={
          <IconButton
            variant="secondary"
            onClick={() => {
              router.replace(sendgridUrls.configuration());
            }}
          >
            <Add />
          </IconButton>
        }
        onClick={(id) => router.replace(sendgridUrls.configuration(id))}
        onDelete={(id) => {
          deleteConfiguration({ id });
        }}
        items={configurations?.map((c) => ({ label: c.configurationName, id: c.id })) || []}
      />
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
