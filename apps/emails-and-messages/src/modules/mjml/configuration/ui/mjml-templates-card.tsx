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
import { mjmlUrls } from "../../urls";
import { messageEventTypesLabels } from "../../../event-handlers/message-event-types";
import { MjmlConfiguration } from "../mjml-config";
import { trpcClient } from "../../../trpc/trpc-client";
import { useAppBridge, actions } from "@saleor/app-sdk/app-bridge";

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

interface MjmlTemplatesCardProps {
  configurationId: string;
  configuration: MjmlConfiguration;
  onEventChanged: () => void;
}

export const MjmlTemplatesCard = ({
  configurationId,
  configuration,
  onEventChanged,
}: MjmlTemplatesCardProps) => {
  const classes = useStyles();
  const router = useRouter();
  const { appBridge } = useAppBridge();

  const { mutate: updateEventConfiguration } =
    trpcClient.mjmlConfiguration.updateEventConfiguration.useMutation({
      onSuccess(data, variables) {
        onEventChanged();
        appBridge?.dispatch(
          actions.Notification({
            title: variables.active ? "Event enabled" : "Event disabled",
            status: "success",
          })
        );
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
                          mjmlUrls.eventConfiguration(configurationId, eventConfiguration.eventType)
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
