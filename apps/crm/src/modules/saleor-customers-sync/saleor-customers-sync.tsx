import { ComponentProps, useEffect, useState } from "react";
import { Box, Button, Text, useTheme, WarningIcon } from "@saleor/macaw-ui";
import { trpcClient } from "../trpc/trpc-client";
import { useDashboardNotification } from "@saleor/apps-shared";
import { useFetchAllCustomers } from "./use-fetch-all-customers";
import { Section } from "../ui/section/section";
import { MailchimpListPicker } from "../mailchimp/mailchimp-list-picker/mailchimp-list-picker";

const RootSection = ({ children, ...props }: ComponentProps<typeof Box>) => {
  return (
    <Section {...props}>
      <Text as="h1" variant="title" size="small" marginBottom={1.5}>
        Bulk sync
      </Text>
      <Text color="textNeutralSubdued" as="p" marginBottom={5}>
        Scan Saleor customers and send them to Mailchimp
      </Text>
      {children}
    </Section>
  );
};

export const SaleorCustomersSync = (props: ComponentProps<typeof Box>) => {
  const [enabled, setEnabled] = useState(false);
  const { customers, totalCustomersCount, done } = useFetchAllCustomers(enabled);
  const theme = useTheme().themeValues;
  const { mutateAsync, status } = trpcClient.mailchimp.audience.bulkAddContacts.useMutation();
  const { notifySuccess } = useDashboardNotification();
  const [selectedList, setSelectedList] = useState<null | string>(null);

  useEffect(() => {
    if (done) {
      mutateAsync({
        listId: selectedList!,
        contacts: customers,
      }).then(() => {
        notifySuccess("Sync successful", "Contacts sent to Mailchimp");
      });
    }
  }, [done]);

  if (!enabled) {
    return (
      <RootSection {...props}>
        <Box display="flex" marginBottom={3} gap={1.5}>
          <WarningIcon />
          <Text as="p">Do not leave the app while indexing</Text>
        </Box>
        <Box display="flex" justifyContent="flex-end" gap={1.5} alignItems="center">
          <Text variant="caption">Sync to the Mailchimp list:</Text>
          <MailchimpListPicker
            onChange={(_, value) => {
              setSelectedList(value);
            }}
          />
          <Button marginLeft={"auto"} disabled={!selectedList} onClick={() => setEnabled(true)}>
            Start
          </Button>
        </Box>
      </RootSection>
    );
  }

  if (status === "success") {
    // todo add link to the dashboard
    return (
      <RootSection {...props}>
        <Text color="textBrandDefault">Contacts synchronized, check your Mailchimp Dashboard</Text>
      </RootSection>
    );
  }

  if (status === "error") {
    return (
      <RootSection {...props}>
        <Text color="textCriticalSubdued">
          Error synchronizing contacts with Mailchimp, please try again
        </Text>
      </RootSection>
    );
  }

  return (
    <RootSection {...props}>
      {totalCustomersCount && (
        <Box display="flex" gap={1.5} alignItems="center" marginBottom={5}>
          <progress
            style={{
              height: 30,
            }}
            color={theme.colors.foreground.iconBrandSubdued}
            max={totalCustomersCount}
            value={customers.length}
          />
          <Text>Synchronizing total {totalCustomersCount} accounts...</Text>
        </Box>
      )}
      {done && (
        <Box>
          <Text as="p" marginBottom={1.5}>
            Fetched customers from Saleor
          </Text>
          {status === "loading" && <Text as="p">Sending customer to Mailchimp in progress...</Text>}
        </Box>
      )}
    </RootSection>
  );
};
