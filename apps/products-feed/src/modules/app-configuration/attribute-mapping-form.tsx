import { AppConfigSchema, RootConfig } from "./app-config";
import { useForm } from "react-hook-form";

import { Box, Button, Text } from "@saleor/macaw-ui";

import React, { useCallback, useMemo } from "react";
import { Multiselect } from "@saleor/react-hook-form-macaw";
import { zodResolver } from "@hookform/resolvers/zod";
import { trpcClient } from "../trpc/trpc-client";
import { useDashboardNotification } from "@saleor/apps-shared";
import { AttributeWithMappingFragmentFragment } from "../../../generated/graphql";

type AttributeMappingConfiguration = Exclude<RootConfig["attributeMapping"], null>;

type Props = {
  initialData: AttributeMappingConfiguration;
  attributes: AttributeWithMappingFragmentFragment[];
  onSubmit(data: AttributeMappingConfiguration): Promise<void>;
};

export const AttributeMappingConfigurationForm = (props: Props) => {
  const { handleSubmit, control } = useForm<AttributeMappingConfiguration>({
    defaultValues: props.initialData,
    resolver: zodResolver(AppConfigSchema.attributeMapping),
  });

  const options = props.attributes.map((a) => ({ value: a.id, label: a.name || a.id })) || [];

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
      <Multiselect
        control={control}
        name="brandAttributeIds"
        label="Brand attributes"
        options={options}
      />
      <Multiselect
        control={control}
        name="colorAttributeIds"
        label="Color attributes"
        options={options}
      />
      <Multiselect
        control={control}
        name="materialAttributeIds"
        label="Material attributes"
        options={options}
      />
      <Multiselect
        control={control}
        name="patternAttributeIds"
        label="Pattern attributes"
        options={options}
      />
      <Multiselect
        control={control}
        name="sizeAttributeIds"
        label="Size attributes"
        options={options}
      />
      <Multiselect
        control={control}
        name="gtinAttributeIds"
        label="GTIN attributes"
        options={options}
      />
      <Box display={"flex"} flexDirection={"row"} gap={4} justifyContent={"flex-end"}>
        <Button type="submit" variant="primary">
          Save mapping
        </Button>
      </Box>
    </Box>
  );
};

export const ConnectedAttributeMappingForm = () => {
  const { notifyError, notifySuccess } = useDashboardNotification();

  const { data: attributes, isLoading: isAttributesLoading } =
    trpcClient.appConfiguration.getAttributes.useQuery();

  const { data, isLoading: isConfigurationLoading } = trpcClient.appConfiguration.fetch.useQuery();

  const isLoading = isAttributesLoading || isConfigurationLoading;

  const { mutate } = trpcClient.appConfiguration.setAttributeMapping.useMutation({
    onSuccess() {
      notifySuccess("Success", "Updated attribute mapping");
    },
    onError() {
      notifyError("Error", "Failed to update, please refresh and try again");
    },
  });

  const handleSubmit = useCallback(
    async (data: AttributeMappingConfiguration) => {
      mutate(data);
    },
    [mutate],
  );

  const formData: AttributeMappingConfiguration = useMemo(() => {
    if (data?.attributeMapping) {
      return data.attributeMapping;
    }

    return {
      colorAttributeIds: [],
      sizeAttributeIds: [],
      brandAttributeIds: [],
      patternAttributeIds: [],
      materialAttributeIds: [],
      gtinAttributeIds: [],
    };
  }, [data]);

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  const showForm = !isLoading && attributes?.length;

  return (
    <>
      {showForm ? (
        <AttributeMappingConfigurationForm
          onSubmit={handleSubmit}
          initialData={formData}
          attributes={attributes}
        />
      ) : (
        <Box>Loading</Box>
      )}
    </>
  );
};
