import { Box, Button, Text } from "@saleor/macaw-ui/next";
import { trpcClient } from "../trpc/trpc-client";
import { AppCard } from "./app-card";
import { Section } from "./app-section";
import { ProviderLabel } from "./provider-label";
import { Table } from "./table";
import { useRouter } from "next/router";

const MatcherTable = () => {
  const { data: connections = [] } = trpcClient.providersConfiguration.getAll.useQuery();

  const isAvatax = connections.some(({ provider }) => provider === "avatax");
  const isTaxJar = connections.some(({ provider }) => provider === "taxjar");

  const router = useRouter();

  return (
    <AppCard __minHeight={"320px"} height="100%">
      <Table.Container>
        <Table.THead>
          <Table.TR>
            <Table.TH>Provider</Table.TH>
          </Table.TR>
        </Table.THead>
        <Table.TBody>
          {isAvatax && (
            <Table.TR>
              <Table.TD>
                <ProviderLabel name="avatax" />
              </Table.TD>
              <Table.TD>
                <Box display="flex" justifyContent={"flex-end"}>
                  <Button
                    onClick={() => router.push("/providers/avatax/matcher")}
                    variant="tertiary"
                  >
                    Configure
                  </Button>{" "}
                </Box>{" "}
              </Table.TD>
            </Table.TR>
          )}
          {isTaxJar && (
            <Table.TR>
              <Table.TD>
                <ProviderLabel name="taxjar" />
              </Table.TD>
              <Table.TD>
                <Box display="flex" justifyContent={"flex-end"}>
                  <Button
                    onClick={() => router.push("/providers/taxjar/matcher")}
                    variant="tertiary"
                  >
                    Configure
                  </Button>{" "}
                </Box>
              </Table.TD>
            </Table.TR>
          )}
        </Table.TBody>
      </Table.Container>
    </AppCard>
  );
};

const Intro = () => {
  return (
    <Section.Description
      title="Tax code matcher"
      description={
        <>
          Tax Code Matcher allows you to map Saleor tax classes to provider tax codes to extend
          products base tax rate.
          <Text as="span" display="block" marginY={4}>
            You need to have at least one provider configured to use this feature.
          </Text>
        </>
      }
    />
  );
};

export const MatcherSection = () => {
  return (
    <>
      <Intro />
      <MatcherTable />
    </>
  );
};
