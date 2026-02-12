import { zodResolver } from "@hookform/resolvers/zod";
import { useDashboardNotification } from "@saleor/apps-shared/use-dashboard-notification";
import { Box, Button, Text } from "@saleor/macaw-ui";
import { Input, Toggle } from "@saleor/react-hook-form-macaw";
import { useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";

import { trpcClient } from "../trpc/trpc-client";
import { AppConfigSchema, RootConfig } from "./app-config";

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
      <Input size={"small"} name={"accessKeyId"} control={control} label="Access key ID" />

      <Input
        type={"password"}
        size={"small"}
        name={"secretAccessKey"}
        control={control}
        label="Secret access key"
      />

      <Input size={"small"} name={"bucketName"} control={control} label="Bucket name" />

      {/* <Select */}
      {/*   control={control} */}
      {/*   label="Region" */}
      {/*   name={"region"} */}
      {/*   required={false} */}
      {/*   options={awsRegionList.map((region) => ({ label: region, value: region }))} */}
      {/* /> */}

      <Input required={true} size={"small"} name={"region"} control={control} label="Region" />

      <Input
        required={false}
        size={"small"}
        name={"endpoint"}
        control={control}
        label="Custom S3 compatible endpoint (leave empty for AWS)"
      />

      <Box as="label" display="flex" gap={2} cursor="pointer">
        <Toggle name={"forcePathStyle"} control={control} type="button" />
        <Text marginLeft={2}>Force path style (leave off for AWS)</Text>
      </Box>

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
    [mutate],
  );

  const handleValidate = useCallback(
    async (data: S3BucketConfiguration) => {
      testConfigurationMutate(data);
    },
    [testConfigurationMutate],
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
      forcePathStyle: false,
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
