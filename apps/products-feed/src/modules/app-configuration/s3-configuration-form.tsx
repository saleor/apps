import { AppConfigSchema, RootConfig } from "./app-config";
import { useForm } from "react-hook-form";

import { Box, Button, Text } from "@saleor/macaw-ui/next";

import React, { useCallback, useMemo } from "react";
import { Input } from "@saleor/react-hook-form-macaw";
import { zodResolver } from "@hookform/resolvers/zod";
import { trpcClient } from "../trpc/trpc-client";
import { useDashboardNotification } from "@saleor/apps-shared";

type S3BucketConfiguration = Exclude<RootConfig["s3"], null>;

type Props = {
  initialData: S3BucketConfiguration;
  onSubmit(data: S3BucketConfiguration): Promise<void>;
};

export const S3ConfigurationForm = (props: Props) => {
  const { handleSubmit, control } = useForm<S3BucketConfiguration>({
    defaultValues: props.initialData,
    resolver: zodResolver(AppConfigSchema.s3Bucket),
  });

  return (
    <Box
      as={"form"}
      display={"flex"}
      gap={5}
      flexDirection={"column"}
      onSubmit={handleSubmit((data) => {
        props.onSubmit(data);
      })}
    >
      <Input size={"small"} name={"accessKeyId"} control={control} label="Amazon access key ID" />

      <Input
        type={"password"}
        size={"small"}
        name={"secretAccessKey"}
        control={control}
        label="Amazon secret access key"
      />

      <Input size={"small"} name={"bucketName"} control={control} label="Bucket name" />

      <Input
        size={"small"}
        name={"region"}
        control={control}
        label="Bucket region"
        helperText={"Use the region code, e.g. 'eu-west-1'"}
        placeholder={"eu-west-1"}
      />

      <Button type="submit" variant="primary" alignSelf={"end"}>
        Save bucket configuration
      </Button>
    </Box>
  );
};

export const ConnectedS3ConfigurationForm = () => {
  const { notifyError, notifySuccess } = useDashboardNotification();

  const { mutate } = trpcClient.appConfiguration.setS3BucketConfiguration.useMutation({
    onSuccess() {
      notifySuccess("Success", "Updated S3 configuration");
    },
    onError() {
      notifyError("Error", "Failed to update, please refresh and try again");
    },
  });
  const { data, isLoading } = trpcClient.appConfiguration.fetch.useQuery();

  const handleSubmit = useCallback(
    async (data: S3BucketConfiguration) => {
      mutate(data);
    },
    [mutate]
  );

  const formData: S3BucketConfiguration = useMemo(() => {
    if (data?.s3) {
      return data.s3;
    }

    return {
      accessKeyId: "",
      bucketName: "",
      region: "",
      secretAccessKey: "",
    };
  }, [data]);

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  return <S3ConfigurationForm onSubmit={handleSubmit} initialData={formData} />;
};
