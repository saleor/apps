import { Box, Button, Text } from "@saleor/macaw-ui/next";
import { BoxWithBorder } from "../../../components/box-with-border";
import { SectionWithDescription } from "../../../components/section-with-description";
import { defaultPadding } from "../../../components/ui-defaults";
import { BoxFooter } from "../../../components/box-footer";
import { SendgridConfiguration } from "../configuration/sendgrid-config";

interface DangerousSectionProps {
  configuration?: SendgridConfiguration;
}

export const DangerousSection = ({ configuration }: DangerousSectionProps) => {
  const onRemoveConfiguration = () => {
    console.log("remove", configuration?.id);
  };

  return (
    <SectionWithDescription title="Danger zone">
      <BoxWithBorder backgroundColor={"surfaceCriticalSubdued"} borderColor={"criticalSubdued"}>
        <Box padding={defaultPadding}>
          <Text variant="heading" display="block">
            Remove provider
          </Text>
          <Text display="block">You can remove provider configuration.</Text>
          <Text display="block">
            This operation will remove all settings related to this configuration. Data will be
            permanently removed from the App.{" "}
          </Text>
          <Text display="block">This operation cant be undone.</Text>
          <Text display="block">You still can create new configuration.</Text>
        </Box>
        <BoxFooter borderColor={"criticalSubdued"}>
          <Button
            color={"textNeutralSubdued"}
            backgroundColor={"interactiveCriticalDefault"}
            onClick={onRemoveConfiguration}
          >
            Remove provider
          </Button>
        </BoxFooter>
      </BoxWithBorder>
    </SectionWithDescription>
  );
};
