import { Box, Button, Text } from "@saleor/macaw-ui/next";
import { BoxWithBorder } from "./box-with-border";
import { BoxFooter } from "./box-footer";
import { defaultPadding } from "./ui-defaults";
import { useRouter } from "next/router";
import { SendgridConfiguration } from "../modules/sendgrid/configuration/sendgrid-config";

const NoExistingConfigurations = () => {
  const { replace } = useRouter();

  const redirectToProvidersSelection = () => {
    replace("/configuration/choose-provider");
  };

  return (
    <BoxWithBorder padding={10} display={"grid"} alignItems={"center"} justifyContent={"center"}>
      <Text>No providers configured yet</Text>
      <Button onClick={redirectToProvidersSelection}>Add first provider</Button>
    </BoxWithBorder>
  );
};

interface MessagingProvidersSectionProps {
  configurations: SendgridConfiguration[];
  isLoading: boolean;
}

export const MessagingProvidersBox = ({
  configurations,
  isLoading: loading,
}: MessagingProvidersSectionProps) => {
  const { replace } = useRouter();

  if (loading) {
    return (
      <BoxWithBorder padding={10} display={"grid"} alignItems={"center"} justifyContent={"center"}>
        <Text>Loading</Text>
      </BoxWithBorder>
    );
  }

  if (configurations.length === 0) {
    return <NoExistingConfigurations />;
  }

  const redirectToProvidersSelection = () => {
    replace("/configuration/choose-provider");
  };

  const redirectToEditConfiguration = (configurationId: string) => {
    replace(`/configuration/sendgrid/edit/${configurationId}`);
  };

  return (
    <BoxWithBorder>
      <Box padding={defaultPadding} display={"grid"} gridTemplateColumns={4}>
        <Text variant="caption">Provider</Text>
        <Text variant="caption">Name</Text>
        <Text variant="caption">Status</Text>
        <Box />
        {configurations.map((configuration) => (
          <>
            <Text>Sendgrid</Text>
            <Text>{configuration.configurationName}</Text>
            <Text>{configuration.active}</Text>
            <Text onClick={() => redirectToEditConfiguration(configuration.id)}>Edit</Text>
          </>
        ))}
      </Box>
      <BoxFooter>
        <Button onClick={redirectToProvidersSelection}>Add provider</Button>
      </BoxFooter>
    </BoxWithBorder>
  );
};
