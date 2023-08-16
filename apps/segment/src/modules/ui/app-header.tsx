import { Breadcrumbs } from "@saleor/apps-ui/src/breadcrumbs";
import { Box, PropsWithBox, Text } from "@saleor/macaw-ui/next";
import { ComponentProps, ReactElement } from "react";

type Props = PropsWithBox<{}>;

export const AppHeader = ({ ...props }: Props) => {
  return (
    <Box
      marginBottom={14}
      borderBottomWidth={1}
      borderBottomStyle="solid"
      borderColor={"neutralHighlight"}
      paddingBottom={6}
      {...props}
    >
      <Text variant="title">Configuration</Text>
    </Box>
  );
};
