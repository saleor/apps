import { Box, Button, Text } from "@saleor/macaw-ui/next";
import { BoxWithBorder } from "./box-with-border";
import { BoxFooter } from "./box-footer";
import { defaultPadding } from "./ui-defaults";
import { useRouter } from "next/router";
import { SendgridConfiguration } from "../modules/sendgrid/configuration/sendgrid-config-schema";
import { TextLink } from "./text-link";
import { ChipText } from "./chip-text";
import Image from "next/image";
import sendgrid from "../public/sendgrid.png";

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
      <Box padding={defaultPadding} display={"grid"} gridTemplateColumns={4} gap={defaultPadding}>
        <Text variant="caption" color="textNeutralSubdued">
          Provider
        </Text>
        <Text variant="caption" color="textNeutralSubdued">
          Configuration name
        </Text>
        <Text variant="caption" color="textNeutralSubdued">
          Status
        </Text>
        <Box />
        {configurations.map((configuration) => (
          <>
            <Box display="flex" gap={defaultPadding}>
              <Image alt="Sendgrid logo" src={sendgrid} height={20} width={20} />
              <Text>Sendgrid</Text>
            </Box>

            <Text>{configuration.name}</Text>
            <ChipText
              content={configuration.active ? "Active" : "Inactive"}
              variant={configuration.active ? "success" : "error"}
            />
            <Box display="flex" justifyContent={"flex-end"}>
              <TextLink href={`/configuration/sendgrid/edit/${configuration.id}`}>Edit</TextLink>
            </Box>
          </>
        ))}
      </Box>
      <BoxFooter>
        <Button onClick={redirectToProvidersSelection}>Add provider</Button>
      </BoxFooter>
    </BoxWithBorder>
  );
};
