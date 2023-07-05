import { Box, Button } from "@saleor/macaw-ui/next";
import { useForm } from "react-hook-form";
import { Input } from "@saleor/react-hook-form-macaw";
import { ContentfulProviderConfigSchemaInputType } from "./config/contentful-config";

export const ContentfulConfigForm = () => {
  const { control } = useForm<ContentfulProviderConfigSchemaInputType>({});

  return (
    <Box as="form" display={"grid"} gap={4}>
      <Input
        required
        control={control}
        name="configName"
        label="Configuration name"
        helperText="Meaningful name that will help you understand it later. E.g. 'staging' or 'prod' "
      />
      <Box display="flex" gap={4} justifyContent="space-between" alignItems="center">
        <Input
          flexGrow={1}
          required
          type="password"
          control={control}
          name="authToken"
          label="Contentful auth token"
          helperText="TODO how to get token"
        />
        <Button variant="secondary">Verify</Button>
      </Box>
    </Box>
  );
};
