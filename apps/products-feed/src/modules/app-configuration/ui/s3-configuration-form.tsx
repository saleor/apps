import { S3BucketConfiguration, s3BucketConfigurationSchema } from "../app-config";
import { useForm } from "react-hook-form";
import { Button, Box } from "@saleor/macaw-ui/next";

import React, { useCallback } from "react";
import { Input } from "@saleor/react-hook-form-macaw";
import { zodResolver } from "@hookform/resolvers/zod";

type Props = {
  initialData: S3BucketConfiguration;
  onSubmit(data: S3BucketConfiguration): Promise<void>;
};

export const S3ConfigurationForm = (props: Props) => {
  const { handleSubmit, control } = useForm<S3BucketConfiguration>({
    defaultValues: props.initialData,
    resolver: zodResolver(s3BucketConfigurationSchema),
  });

  return (
    <Box
      as={"form"}
      display={"flex"}
      gap={8}
      flexDirection={"column"}
      onSubmit={handleSubmit((data) => {
        props.onSubmit(data);
      })}
    >
      <Input size={"small"} name={"accessKeyId"} control={control} label="Amazon access key ID" />

      <Input
        size={"small"}
        name={"secretAccessKey"}
        control={control}
        label="Amazon secret access key"
      />

      <Input size={"small"} name={"bucketName"} control={control} label="Bucket name" />

      <Input size={"small"} name={"region"} control={control} label="Bucket region" />

      <Button type="submit" variant="primary" alignSelf={"end"}>
        Save bucket configuration
      </Button>
    </Box>
  );
};

export const ConnectedS3ConfigurationForm = () => {
  const handleSubmit = useCallback(async () => {}, []);

  // todo fetch config and pass to form
  return (
    <S3ConfigurationForm
      onSubmit={handleSubmit}
      initialData={{
        accessKeyId: "",
        bucketName: "",
        region: "",
        secretAccessKey: "",
      }}
    />
  );
};
