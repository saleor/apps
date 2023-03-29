import { Box, Text, List } from "@saleor/macaw-ui/next";
import { ComponentProps } from "react";
import { trpcClient } from "../../trpc/trpc-client";

export const MailchimpLists = (props: Omit<ComponentProps<typeof Box>, "children">) => {
  const { data, error, status } = trpcClient.mailchimp.audience.getLists.useQuery();

  switch (status) {
    case "error": {
      return (
        <Box {...props}>
          <Text color="textCriticalDefault">Failed fetching Mailchimp lists</Text>
        </Box>
      );
    }

    // TODO need loading component
    case "loading": {
      return (
        <Box {...props}>
          <Text>Loading lists...</Text>
        </Box>
      );
    }

    case "success": {
      return (
        <Box
          padding={8}
          borderColor="neutralHighlight"
          borderWidth={1}
          borderStyle="solid"
          borderRadius={4}
          {...props}
        >
          <List>
            <List.Item disabled>
              <Text variant="title" size="small">
                Available lists
              </Text>
            </List.Item>
            {data.map((listItem) => (
              <List.Item disabled key={listItem.id} paddingY={4}>
                <div>
                  <Text variant="bodyStrong">{listItem.name}</Text>
                  <Box display="grid" justifyContent="space-between">
                    <Text variant="caption">ID: {listItem.id}</Text>
                  </Box>
                </div>
              </List.Item>
            ))}
          </List>
        </Box>
      );
    }
  }
};
