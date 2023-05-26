import { S3BucketConfiguration, SellerShopConfig } from "../app-config";
import { useForm } from "react-hook-form";
import { Box, Button, Text, Input } from "@saleor/macaw-ui/next";

import React from "react";
import { actions, useAppBridge } from "@saleor/app-sdk/app-bridge";

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

  const { appBridge } = useAppBridge();

  return (
    <form
      onSubmit={handleSubmit((data, event) => {
        props.onSubmit(data);
      })}
    >
      <Text>S3 storage</Text>
      <Input label="Amazon access key ID" {...register("accessKeyId")} />

      <Input label="Amazon secret access key" {...register("secretAccessKey")} />

      <Input label="Bucket name" {...register("bucketName")} />

      <Input label="Bucket region" {...register("region")} />

      <Button type="submit" variant="primary">
        Save bucket configuration
      </Button>
    </form>
  );
};
