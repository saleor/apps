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
import smtp from "../public/smtp.svg";

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

type ConfigurationListItem = {
  id: string;
  name: string;
  active: boolean;
  provider: "sendgrid" | "mjml";
};

interface MessagingProvidersSectionProps {
  configurations: ConfigurationListItem[];
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

  const getEditLink = (configuration: ConfigurationListItem) => {
    switch (configuration.provider) {
      case "mjml":
        return `/configuration/mjml/edit/${configuration.id}`;
      case "sendgrid":
        return `/configuration/sendgrid/edit/${configuration.id}`;
    }
  };

  const getProviderLogo = (configuration: ConfigurationListItem) => {
    switch (configuration.provider) {
      case "mjml":
        return <Image alt="SMTP logo" src={smtp} height={20} width={20} />;
      case "sendgrid":
        return <Image alt="Sendgrid logo" src={sendgrid} height={20} width={20} />;
    }
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
              {getProviderLogo(configuration)}
              <Text>{configuration.provider}</Text>
            </Box>

            <Text>{configuration.name}</Text>
            <ChipText
              content={configuration.active ? "Active" : "Inactive"}
              variant={configuration.active ? "success" : "error"}
            />
            <Box display="flex" justifyContent={"flex-end"}>
              <TextLink href={getEditLink(configuration)}>Edit</TextLink>
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
