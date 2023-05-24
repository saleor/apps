import { Box, Button, Text } from "@saleor/macaw-ui/next";
import { SemanticChip } from "@saleor/apps-ui";
import { BoxWithBorder } from "../../../components/box-with-border";
import { BoxFooter } from "../../../components/box-footer";
import { defaultPadding } from "../../../components/ui-defaults";
import { useRouter } from "next/router";
import Image from "next/image";
import sendgrid from "../../../public/sendgrid.png";
import smtp from "../../../public/smtp.svg";
import { smtpUrls } from "../../smtp/urls";
import { sendgridUrls } from "../../sendgrid/urls";
import { appUrls } from "../urls";
import React from "react";

const NoExistingConfigurations = () => {
  const { replace } = useRouter();

  const redirectToProvidersSelection = () => {
    replace("/configuration/choose-provider");
  };

  return (
    <BoxWithBorder padding={10} display="grid" alignItems="center" justifyContent="center">
      <Text>No providers configured yet</Text>
      <Button onClick={redirectToProvidersSelection}>Add first provider</Button>
    </BoxWithBorder>
  );
};

type ProviderType = "sendgrid" | "smtp";

const providerLabels: Record<ProviderType, string> = {
  sendgrid: "Sendgrid",
  smtp: "SMTP",
};

export type ConfigurationListItem = {
  id: string;
  name: string;
  active: boolean;
  provider: ProviderType;
};

interface MessagingProvidersSectionProps {
  configurations: ConfigurationListItem[];
  isLoading: boolean;
}

export const MessagingProvidersBox = ({
  configurations,
  isLoading: loading,
}: MessagingProvidersSectionProps) => {
  const { push } = useRouter();

  if (loading) {
    return (
      <BoxWithBorder padding={10} display="grid" alignItems="center" justifyContent="center">
        <Text>Loading</Text>
      </BoxWithBorder>
    );
  }

  if (configurations.length === 0) {
    return <NoExistingConfigurations />;
  }

  const redirectToProvidersSelection = () => {
    push(appUrls.chooseProvider());
  };

  const getEditLink = (configuration: ConfigurationListItem) => {
    switch (configuration.provider) {
      case "smtp":
        return smtpUrls.configuration(configuration.id);
      case "sendgrid":
        return sendgridUrls.configuration(configuration.id);
    }
  };

  const getProviderLogo = (configuration: ConfigurationListItem) => {
    switch (configuration.provider) {
      case "smtp":
        return <Image alt="SMTP logo" src={smtp} height={20} width={20} />;
      case "sendgrid":
        return <Image alt="Sendgrid logo" src={sendgrid} height={20} width={20} />;
    }
  };

  return (
    <BoxWithBorder>
      <Box padding={defaultPadding} display="grid" gridTemplateColumns={4} gap={defaultPadding}>
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
          <React.Fragment key={configuration.id}>
            <Box display="flex" gap={defaultPadding}>
              {getProviderLogo(configuration)}
              <Text>{providerLabels[configuration.provider]}</Text>
            </Box>

            <Text>{configuration.name}</Text>
            <Box __maxWidth="fit-content">
              <SemanticChip variant={configuration.active ? "success" : "error"}>
                {configuration.active ? "Active" : "Inactive"}
              </SemanticChip>
            </Box>
            <Box display="flex" justifyContent="flex-end">
              <Button
                variant="tertiary"
                size="small"
                onClick={() => {
                  push(getEditLink(configuration));
                }}
              >
                Edit
              </Button>
            </Box>
          </React.Fragment>
        ))}
      </Box>
      <BoxFooter>
        <Button onClick={redirectToProvidersSelection}>Add provider</Button>
      </BoxFooter>
    </BoxWithBorder>
  );
};
