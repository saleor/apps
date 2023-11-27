import { Box, PropsWithBox, Text } from "@saleor/macaw-ui";
import { ReactNode } from "react";

type AppSectionProps = PropsWithBox<{
  heading: ReactNode;
  sideContent?: ReactNode;
  includePadding?: boolean;
  leftColumnWidthPx?: number;
  maxWidthPx?: number;
}>;

const AppSectionCard = ({
  children,
  footer,
  includePadding = true,
  ...props
}: PropsWithBox<{
  footer?: ReactNode;
  includePadding?: boolean;
}>) => {
  return (
    <Box
      borderStyle={"solid"}
      borderColor={"neutralPlain"}
      borderWidth={1}
      borderRadius={4}
      {...props}
    >
      <Box padding={includePadding ? 5 : 0}>{children}</Box>
      {footer && (
        <Box
          borderTopStyle="solid"
          borderTopWidth={1}
          borderColor="neutralHighlight"
          padding={includePadding ? 5 : 0}
          marginTop={5}
        >
          {footer}
        </Box>
      )}
    </Box>
  );
};

const AppSection = ({
  heading,
  sideContent,
  includePadding = true,
  leftColumnWidthPx = 400,
  maxWidthPx = 1200,
  children,
  ...props
}: AppSectionProps) => {
  return (
    <Box
      as="section"
      __gridTemplateColumns={`${leftColumnWidthPx}px auto`}
      display={"grid"}
      gap={10}
      __maxWidth={`${maxWidthPx}px`}
      alignItems="start"
      {...props}
    >
      <Box>
        <Text as="h2" variant={"heading"} size={"large"} marginBottom={1.5}>
          {heading}
        </Text>
        {sideContent}
      </Box>
      {children}
    </Box>
  );
};

export const Layout = {
  AppSection,
  AppSectionCard,
};
