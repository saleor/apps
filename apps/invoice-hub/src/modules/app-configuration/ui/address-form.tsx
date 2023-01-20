import { SellerShopConfig } from "../app-config";
import { useForm } from "react-hook-form";
import { TextField, TextFieldProps, Typography } from "@material-ui/core";
import { Button, makeStyles } from "@saleor/macaw-ui";
import React from "react";
import { actions, useAppBridge } from "@saleor/app-sdk/app-bridge";

const useStyles = makeStyles({
  field: {
    marginBottom: 20,
  },
  form: {
    padding: 20,
  },
  channelName: {
    fontFamily: "monospace",
    cursor: "pointer",
  },
});

type Props = {
  channelSlug: string;
  channelName: string;
  channelID: string;
  onSubmit(data: SellerShopConfig["address"]): Promise<void>;
  initialData?: SellerShopConfig["address"] | null;
};

export const AddressForm = (props: Props) => {
  const { register, handleSubmit } = useForm<SellerShopConfig["address"]>({
    defaultValues: props.initialData ?? undefined,
  });
  const styles = useStyles();
  const { appBridge } = useAppBridge();

  const CommonFieldProps: TextFieldProps = {
    className: styles.field,
    fullWidth: true,
  };

  const handleChannelNameClick = () => {
    appBridge?.dispatch(
      actions.Redirect({
        to: `/channels/${props.channelID}`,
      })
    );
  };

  return (
    <form
      onSubmit={handleSubmit((data, event) => {
        props.onSubmit(data);
      })}
      className={styles.form}
    >
      <Typography variant="body1" paragraph>
        Configure
        <strong onClick={handleChannelNameClick} className={styles.channelName}>
          {` ${props.channelName} `}
        </strong>
        channel:
      </Typography>
      <TextField label="Company Name" {...CommonFieldProps} {...register("companyName")} />
      <TextField {...CommonFieldProps} label="First Name" {...register("firstName")} />
      <TextField {...CommonFieldProps} label="Last Name" {...register("lastName")} />
      <TextField label="Street Address 1" {...CommonFieldProps} {...register("streetAddress1")} />
      <TextField {...CommonFieldProps} label="Street Address 2" {...register("streetAddress2")} />
      <div style={{ display: "grid", gap: 20, gridTemplateColumns: "1fr 2fr" }}>
        <TextField {...CommonFieldProps} label="Postal Code" {...register("postalCode")} />
        <TextField {...CommonFieldProps} label="City" {...register("city")} />
      </div>
      <TextField {...CommonFieldProps} label="City Area" {...register("cityArea")} />
      <TextField {...CommonFieldProps} label="Country" {...register("country")} />
      <TextField label="Country Area" {...CommonFieldProps} {...register("countryArea")} />
      <Button type="submit" fullWidth variant="primary">
        Save channel configuration
      </Button>
    </form>
  );
};
