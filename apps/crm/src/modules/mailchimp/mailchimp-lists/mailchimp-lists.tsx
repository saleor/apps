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
        <Box {...props}>
          <List>
            <List.Item disabled>
              <Text variant="heading">Mailchimp lists</Text>
            </List.Item>
            {data.map((listItem) => (
              <List.Item disabled key={listItem.id} paddingY={4}>
                <div>
                  <Text variant="bodyStrong">{listItem.name}</Text>
                  <Box marginLeft={6} display="grid" justifyContent="space-between">
                    <Text variant="caption">ID: {listItem.id}</Text>
                    <Text variant="caption">Members: {listItem.members}</Text>
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
