import { Box, Button } from "@saleor/macaw-ui/next";
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
    <AppCard>
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
          Extend the base tax rate of your products by mapping Saleor tax classes to provider tax
          codes.
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
