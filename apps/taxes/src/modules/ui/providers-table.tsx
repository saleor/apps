import { Box, BoxProps, Button, Text } from "@saleor/macaw-ui/next";
import Image from "next/image";
import { useRouter } from "next/router";
import { AvataxIcon, TaxJarIcon } from "../../assets";
import { ProviderConfig, ProviderName } from "../providers-configuration/providers-config";
import { trpcClient } from "../trpc/trpc-client";

export const Table = {
  Container: (props: BoxProps) => <Box __textAlign={"left"} width="100%" {...props} as="table" />,
  THead: (props: BoxProps) => <Box {...props} as="thead" />,
  TR: (props: BoxProps) => <Box {...props} as="tr" />,
  TH: (props: BoxProps) => (
    <Box fontWeight={"captionSmall"} fontSize={"captionSmall"} {...props} as="th" />
  ),
  TBody: (props: BoxProps) => <Box {...props} as="tbody" />,
  TD: (props: BoxProps) => <Box fontSize="bodyMedium" paddingY={4} {...props} as="td" />,
};

const providerIconMap: Record<ProviderName, { label: string; icon: string }> = {
  avatax: {
    icon: AvataxIcon,
    label: "Avatax",
  },
  taxjar: {
    icon: TaxJarIcon,
    label: "TaxJar",
  },
};

const ProviderIcon = ({ provider }: { provider: ProviderName }) => {
  const { icon, label } = providerIconMap[provider];

  return (
    <Box alignItems={"center"} display={"flex"} gap={4}>
      <Image src={icon} width={20} height={20} alt={`${provider} icon`} />
      <Text __color="inherit" marginTop={2}>
        {label}
      </Text>
    </Box>
  );
};

export const ProvidersTable = () => {
  const router = useRouter();
  const { data } = trpcClient.providersConfiguration.getAll.useQuery();

  const itemClickHandler = (item: ProviderConfig) => {
    router.push(`/providers/${item.provider}/${item.id}`);
  };

  return (
    <Table.Container>
      <Table.THead color={"textNeutralSubdued"}>
        <Table.TR>
          <Table.TH>Name</Table.TH>
          <Table.TH>Provider</Table.TH>
        </Table.TR>
      </Table.THead>
      <Table.TBody>
        {data?.map((item) => (
          <Table.TR>
            <Table.TD>{item.config.name}</Table.TD>
            <Table.TD>
              <ProviderIcon provider={item.provider} />
            </Table.TD>
            <Table.TD onClick={() => itemClickHandler(item)}>
              <Box display={"flex"} justifyContent={"flex-end"}>
                <Button variant="tertiary">Edit</Button>
              </Box>
            </Table.TD>
          </Table.TR>
        ))}
      </Table.TBody>
    </Table.Container>
  );
};
