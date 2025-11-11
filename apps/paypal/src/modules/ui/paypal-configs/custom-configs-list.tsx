import { Layout } from "@saleor/apps-ui";
import { Box, Button, Text, TrashBinIcon } from "@saleor/macaw-ui";
import { ReactNode } from "react";

type Config = {
  name: string;
  id: string;
  deleteButtonSlotLeft?(): ReactNode;
  deleteButtonSlotRight?(): ReactNode;
};

type Props = {
  configs: Array<Config>;
  onConfigDelete(configId: string): void;
  isLoading?: boolean;
};

export const CustomConfigsList = ({
  configs,
  onConfigDelete,
  isLoading = false,
  ...props
}: Props) => {
  return (
    <Layout.AppSectionCard>
      <Box {...props}>
        {configs.map((config) => {
          return (
            <Box paddingY={4} key={config.id}>
              <Box
                display={"flex"}
                justifyContent="space-between"
                width={"100%"}
                alignItems={"center"}
              >
                <Text marginRight={"auto"} display="block">
                  {config.name}
                </Text>
                {config.deleteButtonSlotLeft && config.deleteButtonSlotLeft()}
                <Button
                  disabled={isLoading}
                  marginLeft={4}
                  display="block"
                  icon={<TrashBinIcon />}
                  variant="secondary"
                  onClick={() => onConfigDelete(config.id)}
                />
              </Box>
              {config.deleteButtonSlotRight && (
                <Box marginLeft={4}>{config.deleteButtonSlotRight()}</Box>
              )}
            </Box>
          );
        })}
      </Box>
    </Layout.AppSectionCard>
  );
};
