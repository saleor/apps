import { Divider, Paper, Typography } from "@material-ui/core";
import React from "react";
import {
  EditIcon,
  IconButton,
  List,
  ListHeader,
  ListItem,
  ListItemCell,
  makeStyles,
  SwitchSelector,
  SwitchSelectorButton,
} from "@saleor/macaw-ui";
import { useRouter } from "next/router";
import { messageEventTypesLabels } from "../../../event-handlers/message-event-types";
import { trpcClient } from "../../../trpc/trpc-client";
import { useAppBridge, actions } from "@saleor/app-sdk/app-bridge";
import { SendgridConfiguration } from "../sendgrid-config";
import { sendgridUrls } from "../../urls";
import { useDashboardNotification } from "@saleor/apps-shared";

const useStyles = makeStyles((theme) => {
  return {
    spaceBetween: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    rowActions: {
      display: "flex",
      justifyContent: "flex-end",
      gap: theme.spacing(1),
    },
    tableRow: {
      minHeight: "48px",
      "&::after": {
        display: "none",
      },
    },
  };
});

interface SendgridTemplatesCardProps {
  configurationId: string;
  configuration: SendgridConfiguration;
  onEventChanged: () => void;
}

export const SendgridTemplatesCard = ({
  configurationId,
  configuration,
  onEventChanged,
}: SendgridTemplatesCardProps) => {
  const classes = useStyles();
  const router = useRouter();
  const { notifySuccess } = useDashboardNotification();

  const { mutate: updateEventConfiguration } =
    trpcClient.sendgridConfiguration.updateEventConfiguration.useMutation({
      onSuccess(_data, variables) {
        onEventChanged();
        notifySuccess(variables.active ? "Event enabled" : "Event disabled");
      },
    });

  return (
    <Paper elevation={0}>
      <ListHeader>
        <ListItem className={classes.tableRow}>
          <ListItemCell>Supported events and templates</ListItemCell>
        </ListItem>
      </ListHeader>
      <List gridTemplate={["1fr"]}>
        <Divider />
        {configuration.events.map((eventConfiguration) => (
          <React.Fragment key={eventConfiguration.eventType}>
            <ListItem className={classes.tableRow}>
              <ListItemCell>
                <div className={classes.spaceBetween}>
                  <Typography>{messageEventTypesLabels[eventConfiguration.eventType]}</Typography>
                  <div className={classes.rowActions}>
                    {/* TODO: fix types in the MacawUI */}
                    {/* @ts-ignore: MacawUI use wrong type for */}
                    <SwitchSelector key={eventConfiguration.eventType}>
                      {[
                        { label: "Active", value: true },
                        { label: "Disabled", value: false },
                      ].map((button) => (
                        // @ts-ignore: MacawUI use wrong type for SwitchSelectorButton
                        <SwitchSelectorButton
                          value={button.value.toString()}
                          onClick={() => {
                            updateEventConfiguration({
                              configurationId,
                              ...eventConfiguration,
                              active: button.value,
                            });
                          }}
                          activeTab={eventConfiguration.active.toString()}
                          key={button.label}
                        >
                          {button.label}
                        </SwitchSelectorButton>
                      ))}
                    </SwitchSelector>
                    <IconButton
                      variant="secondary"
                      onClick={(event) => {
                        event.stopPropagation();
                        event.preventDefault();
                        router.push(
                          sendgridUrls.eventConfiguration(
                            configurationId,
                            eventConfiguration.eventType
                          )
                        );
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                  </div>
                </div>
              </ListItemCell>
            </ListItem>
            <Divider />
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );
};
