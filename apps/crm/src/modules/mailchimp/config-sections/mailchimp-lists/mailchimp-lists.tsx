import { Box, Chip, List, PropsWithBox, Text } from "@saleor/macaw-ui";
import { trpcClient } from "../../../trpc/trpc-client";
import { Section } from "../../../ui/section/section";

const Wrapper = ({ children, ...props }: PropsWithBox<{}>) => {
  return (
    <Section {...props}>
      <Text variant="title" size="small" as="h1">
        Available lists
      </Text>
      {children}
    </Section>
  );
};

export const MailchimpLists = (props: PropsWithBox<{}>) => {
  const { data, error, status } = trpcClient.mailchimp.audience.getLists.useQuery();

  switch (status) {
    case "error": {
      return (
        <Wrapper {...props}>
          <Text color="textCriticalDefault">Failed fetching Mailchimp lists</Text>
        </Wrapper>
      );
    }

    case "loading": {
      return (
        <Wrapper {...props}>
          <Text as="p" marginTop={1.5}>
            Loading lists...
          </Text>
        </Wrapper>
      );
    }

    case "success": {
      return (
        <Wrapper {...props}>
          <List>
            {data.map((listItem) => (
              <List.Item
                disabled
                key={listItem.id}
                paddingY={1.5}
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Text>{listItem.name}</Text>
                <Text variant="caption">
                  <Box __display="inline-block" marginRight={0.5}>
                    <Chip size="small">ID</Chip>
                  </Box>
                  {listItem.id}
                </Text>
              </List.Item>
            ))}
          </List>
        </Wrapper>
      );
    }
  }
};
