import { AppConfigSchema, RootConfig } from "./app-config";
import { useForm } from "react-hook-form";

import { Box, Button, Text } from "@saleor/macaw-ui";

import React, { useCallback, useMemo } from "react";
import { Input, Select } from "@saleor/react-hook-form-macaw";
import { zodResolver } from "@hookform/resolvers/zod";
import { trpcClient } from "../trpc/trpc-client";
import { useDashboardNotification } from "@saleor/apps-shared";
import { awsRegionList } from "../file-storage/s3/aws-region-list";

type S3BucketConfiguration = Exclude<RootConfig["s3"], null>;

type Props = {
  initialData: S3BucketConfiguration;
  onSubmit(data: S3BucketConfiguration): Promise<void>;
  onValidate(data: S3BucketConfiguration): Promise<void>;
};

export const S3ConfigurationForm = (props: Props) => {
  const { handleSubmit, control, getValues } = useForm<S3BucketConfiguration>({
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

      <Select
        control={control}
        label="Region"
        name={"region"}
        options={awsRegionList.map((region) => ({ label: region, value: region }))}
      />

      <Box display={"flex"} flexDirection={"row"} gap={4} justifyContent={"flex-end"}>
        <Button variant="secondary" onClick={() => props.onValidate(getValues())}>
          Test credentials
        </Button>
        <Button type="submit" variant="primary">
          Save bucket configuration
        </Button>
      </Box>
    </Box>
  );
};

export const ConnectedS3ConfigurationForm = () => {
  const { notifyError, notifySuccess } = useDashboardNotification();

  const { mutate } = trpcClient.appConfiguration.setS3BucketConfiguration.useMutation({
    onSuccess() {
      notifySuccess("Success", "Updated S3 configuration");
    },
    onError({ message }) {
      if (message) {
        notifyError("Error", message);
        return;
      }
      notifyError("Error", "Failed to update, please refresh and try again");
    },
  });

  const { mutate: testConfigurationMutate } =
    trpcClient.appConfiguration.testS3BucketConfiguration.useMutation({
      onSuccess() {
        notifySuccess("Configuration is valid");
      },
      onError({ message }) {
        notifyError("Error", message);
      },
    });

  const { data, isLoading } = trpcClient.appConfiguration.fetch.useQuery();

  const handleSubmit = useCallback(
    async (data: S3BucketConfiguration) => {
      mutate(data);
    },
    [mutate]
  );

  const handleValidate = useCallback(
    async (data: S3BucketConfiguration) => {
      testConfigurationMutate(data);
    },
    [testConfigurationMutate]
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

  return (
    <S3ConfigurationForm
      onSubmit={handleSubmit}
      initialData={formData}
      onValidate={handleValidate}
    />
  );
};
