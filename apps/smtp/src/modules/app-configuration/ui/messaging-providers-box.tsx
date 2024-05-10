import { Box, Button, Text } from "@saleor/macaw-ui";
import { SemanticChip } from "@saleor/apps-ui";
import { BoxWithBorder } from "../../../components/box-with-border";
import { BoxFooter } from "../../../components/box-footer";
import { defaultPadding } from "../../../components/ui-defaults";
import { useRouter } from "next/router";
import { smtpUrls } from "../../smtp/urls";
import React from "react";

const NoExistingConfigurations = () => {
  const { push } = useRouter();

  const redirectToNewConfiguration = () => {
    push(smtpUrls.newConfiguration());
  };

  return (
    <BoxWithBorder padding={10} display="grid" alignItems="center" justifyContent="center">
      <Button onClick={redirectToNewConfiguration}>Add first configuration</Button>
    </BoxWithBorder>
  );
};

type ProviderType = "smtp";

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
      <BoxWithBorder padding={7} display="grid" alignItems="center" justifyContent="center">
        <Text>Loading</Text>
      </BoxWithBorder>
    );
  }

  if (configurations.length === 0) {
    return <NoExistingConfigurations />;
  }

  const redirectToProvidersSelection = () => {
    push(smtpUrls.newConfiguration());
  };

  const getEditLink = (configuration: ConfigurationListItem) => {
    switch (configuration.provider) {
      case "smtp":
        return smtpUrls.configuration(configuration.id);
    }
  };

  return (
    <BoxWithBorder>
      <Box padding={defaultPadding} display="grid" gridTemplateColumns={3} gap={defaultPadding}>
        <Text variant="caption" color="textNeutralSubdued">
          Configuration name
        </Text>
        <Text variant="caption" color="textNeutralSubdued">
          Status
        </Text>
        <Box />
        {configurations.map((configuration) => (
          <React.Fragment key={configuration.id}>
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
        <Button onClick={redirectToProvidersSelection}>Add configuration</Button>
      </BoxFooter>
    </BoxWithBorder>
  );
};
