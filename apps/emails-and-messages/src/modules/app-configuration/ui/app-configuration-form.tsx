import { AppConfigurationPerChannel } from "../app-config";
import { Controller, useForm } from "react-hook-form";
import { FormControl, InputLabel, Link, MenuItem, Select, Typography } from "@material-ui/core";
import { Button, makeStyles, SwitchSelector, SwitchSelectorButton } from "@saleor/macaw-ui";
import React, { useEffect } from "react";
import { actions, useAppBridge } from "@saleor/app-sdk/app-bridge";
import { useRouter } from "next/router";
import { mjmlUrls } from "../../mjml/urls";

const useStyles = makeStyles((theme) => ({
  field: {
    marginBottom: 20,
  },
  channelName: {
    cursor: "pointer",
    borderBottom: `2px solid ${theme.palette.secondary.main}`,
  },
}));

type AppConfigurationFormProps = {
  channelSlug: string;
  channelName: string;
  channelID: string;
  mjmlConfigurationChoices: { label: string; value: string }[];
  sendgridConfigurationChoices: { label: string; value: string }[];
  onSubmit(data: AppConfigurationPerChannel): Promise<void>;
  initialData?: AppConfigurationPerChannel | null;
};

export const AppConfigurationForm = (props: AppConfigurationFormProps) => {
  const styles = useStyles();
  const { appBridge } = useAppBridge();
  const router = useRouter();

  const { handleSubmit, getValues, setValue, control, reset } = useForm<AppConfigurationPerChannel>(
    {
      defaultValues: props.initialData ?? undefined,
    }
  );

  useEffect(() => {
    reset(props.initialData || undefined);
  }, [props.initialData, reset]);

  const handleChannelNameClick = () => {
    appBridge?.dispatch(
      actions.Redirect({
        to: `/channels/${props.channelID}`,
      })
    );
  };

  const isNoSendgridConfigurations = !props.sendgridConfigurationChoices.length;
  const isNoMjmlConfigurations = !props.mjmlConfigurationChoices.length;

  return (
    <form
      onSubmit={handleSubmit((data, event) => {
        props.onSubmit(data);
      })}
    >
      <Typography variant="h2" paragraph>
        Configure
        <span onClick={handleChannelNameClick} className={styles.channelName}>
          {` ${props.channelName} `}
        </span>
        channel:
      </Typography>

      <Controller
        control={control}
        name="active"
        render={({ field: { value, name, onChange } }) => (
          <div className={styles.field}>
            {/* TODO: fix types in the MacawUI */}
            {/* @ts-ignore: MacawUI use wrong type for */}
            <SwitchSelector key={name} className={styles.field}>
              {[
                { label: "Active", value: true },
                { label: "Disabled", value: false },
              ].map((button) => (
                // @ts-ignore: MacawUI use wrong type for SwitchSelectorButton
                <SwitchSelectorButton
                  value={button.value.toString()}
                  onClick={() => onChange(button.value)}
                  activeTab={value?.toString() || "false"}
                  key={button.label}
                >
                  {button.label}
                </SwitchSelectorButton>
              ))}
            </SwitchSelector>
          </div>
        )}
      />

      <Controller
        control={control}
        name="mjmlConfigurationId"
        render={({ field: { value, onChange } }) => {
          return (
            <FormControl disabled={isNoMjmlConfigurations} className={styles.field} fullWidth>
              <InputLabel>MJML Configuration</InputLabel>
              <Select
                variant="outlined"
                value={value}
                onChange={(event, val) => {
                  onChange(event.target.value);
                }}
              >
                <MenuItem key="none" value={undefined}>
                  No configuration
                </MenuItem>
                {props.mjmlConfigurationChoices.map((choice) => (
                  <MenuItem key={choice.value} value={choice.value}>
                    {choice.label}
                  </MenuItem>
                ))}
              </Select>
              {isNoMjmlConfigurations && (
                <Link
                  href="#"
                  onClick={() => {
                    router.push(mjmlUrls.configuration());
                  }}
                >
                  <Typography variant="caption" color="textSecondary">
                    Currently theres no MJML configuration available. Click here to create one.
                  </Typography>
                </Link>
              )}
            </FormControl>
          );
        }}
      />

      <Controller
        control={control}
        name="sendgridConfigurationId"
        render={({ field: { value, onChange } }) => {
          return (
            <FormControl disabled={isNoSendgridConfigurations} className={styles.field} fullWidth>
              <InputLabel>Sendgrid Configuration</InputLabel>
              <Select
                variant="outlined"
                value={value}
                onChange={(event, val) => {
                  onChange(event.target.value);
                }}
              >
                <MenuItem key="none" value={undefined}>
                  No configuration
                </MenuItem>
                {props.sendgridConfigurationChoices.map((choice) => (
                  <MenuItem key={choice.value} value={choice.value}>
                    {choice.label}
                  </MenuItem>
                ))}
              </Select>
              {isNoSendgridConfigurations && (
                <Link
                  href="#"
                  onClick={() => {
                    router.push("");
                  }}
                >
                  <Typography variant="caption" color="textSecondary">
                    Currently theres no Sendgrid configuration available. Click here to create one.
                  </Typography>
                </Link>
              )}
            </FormControl>
          );
        }}
      />
      <Button type="submit" fullWidth variant="primary">
        Save configuration
      </Button>
    </form>
  );
};
