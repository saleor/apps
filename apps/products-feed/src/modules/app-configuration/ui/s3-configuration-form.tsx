import { S3BucketConfiguration, SellerShopConfig } from "../app-config";
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
  onSubmit(data: S3BucketConfiguration): Promise<void>;
  initialData?: S3BucketConfiguration | null;
};

export const S3ConfigurationForm = (props: Props) => {
  const { register, handleSubmit } = useForm<S3BucketConfiguration>({
    defaultValues: props.initialData ?? undefined,
  });
  const styles = useStyles();
  const { appBridge } = useAppBridge();

  const CommonFieldProps: TextFieldProps = {
    className: styles.field,
    fullWidth: true,
  };

  return (
    <form
      onSubmit={handleSubmit((data, event) => {
        props.onSubmit(data);
      })}
      className={styles.form}
    >
      <Typography variant="h3" paragraph>
        S3 storage
      </Typography>
      <TextField label="Amazon access key ID" {...CommonFieldProps} {...register("accessKeyId")} />

      <TextField
        label="Amazon secret access key"
        {...CommonFieldProps}
        {...register("secretAccessKey")}
      />

      <TextField label="Bucket name" {...CommonFieldProps} {...register("bucketName")} />

      <TextField label="Bucket region" {...CommonFieldProps} {...register("region")} />

      <Button type="submit" fullWidth variant="primary">
        Save bucket configuration
      </Button>
    </form>
  );
};
