import { Box, Text } from "@saleor/macaw-ui";
import Image from "next/image";
import { ProviderName } from "../provider-connections/provider-connections";
import { TaxJarIcon } from "../../assets";

const providerConfig = {
  taxjar: {
    label: "TaxJar",
    icon: TaxJarIcon,
  },
} satisfies Record<
  ProviderName,
  {
    label: string;
    icon: string;
  }
>;

export const ProviderLabel = ({ name }: { name: ProviderName }) => {
  const { label, icon } = providerConfig[name];

  return (
    <Box alignItems={"center"} display={"flex"} gap={3}>
      <Image src={icon} width={20} height={20} alt={`provider icon`} />
      <Text variant="bodyStrong">{label}</Text>
    </Box>
  );
};
