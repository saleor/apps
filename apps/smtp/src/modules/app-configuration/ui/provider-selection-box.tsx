import { Box, Button, Text } from "@saleor/macaw-ui";

import { BoxFooter } from "../../../components/box-footer";
import { BoxWithBorder } from "../../../components/box-with-border";
import { defaultPadding } from "../../../components/ui-defaults";

interface ProviderSelectionBoxProps {
  providerName: string;
  providerLogo?: React.ReactNode;
  providerDescription: string;
  onClick: () => void;
}

export const ProviderSelectionBox = (props: ProviderSelectionBoxProps) => {
  return (
    <BoxWithBorder __maxWidth={350} display="flex" flexDirection="column">
      <Box padding={defaultPadding} flexGrow="1">
        <Box
          display="flex"
          gap={2}
          alignItems="center"
          justifyContent="center"
          paddingBottom={defaultPadding}
        >
          {props.providerLogo}
          <Text size={5} fontWeight="bold">
            {props.providerName}
          </Text>
        </Box>
        <Text>{props.providerDescription}</Text>
      </Box>
      <BoxFooter>
        <Button onClick={props.onClick}>Choose</Button>
      </BoxFooter>
    </BoxWithBorder>
  );
};
