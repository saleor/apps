import { Box, Button, Text } from "@saleor/macaw-ui/next";
import { BoxWithBorder } from "../../../components/box-with-border";
import { defaultPadding } from "../../../components/ui-defaults";
import { BoxFooter } from "../../../components/box-footer";

interface ProviderSelectionBoxProps {
  providerName: string;
  providerDescription: string;
  onClick: () => void;
}

export const ProviderSelectionBox = (props: ProviderSelectionBoxProps) => {
  return (
    <BoxWithBorder display="grid" alignItems="center" justifyContent="center">
      <Box padding={defaultPadding} display="grid" alignItems="center" justifyContent="center">
        <Text variant="heading">{props.providerName}</Text>
      </Box>
      <Box padding={defaultPadding} display="grid" alignItems="center" justifyContent="center">
        <Text>{props.providerDescription}</Text>
      </Box>
      <BoxFooter justifyContent="center" alignItems="center">
        <Button onClick={props.onClick}>Choose</Button>
      </BoxFooter>
    </BoxWithBorder>
  );
};
