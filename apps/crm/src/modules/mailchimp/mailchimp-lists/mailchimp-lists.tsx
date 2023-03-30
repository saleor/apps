import { Box, List, PropsWithBox, Text } from "@saleor/macaw-ui/next";
import { trpcClient } from "../../trpc/trpc-client";
import { Section } from "../../ui/section/section";

export const MailchimpLists = (props: PropsWithBox<{}>) => {
  const { data, error, status } = trpcClient.mailchimp.audience.getLists.useQuery();

  switch (status) {
    case "error": {
      return (
        <Section {...props}>
          <Text color="textCriticalDefault">Failed fetching Mailchimp lists</Text>
        </Section>
      );
    }

    // TODO need loading component
    case "loading": {
      return (
        <Section {...props}>
          <Text>Loading lists...</Text>
        </Section>
      );
    }

    case "success": {
      return (
        <Section {...props}>
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
        </Section>
      );
    }
  }
};
