import Image from "next/image";
import DatadogLogo from "../assets/datadog/dd_logo_h_rgb.svg";
import NewRelicLogo from "../assets/new-relic/new_relic_logo_horizontal.svg";
import LogzLogo from "../assets/logzio/1584985593-blue-horizontal.svg";
import React from "react";
import { Section } from "./sections";
import clsx from "clsx";
import { useRouter } from "next/router";
import { useConfigQuery } from "../../generated/graphql";
import { Text, Box } from "@saleor/macaw-ui/next";

type Props = {
  activeProvider: "datadog" | string | null;
};

export const IntegrationsList = ({ activeProvider }: Props) => {
  const router = useRouter();
  const [queryData] = useConfigQuery();

  const isDatadogConfigured = queryData.data?.integrations.datadog?.credentials;
  const isDatadogError = queryData.data?.integrations.datadog?.error;

  return (
    <Box as={"ul"} display={"grid"} gap={4} gridAutoFlow={"row"}>
      <Box
        as={"li"}
        cursor={"pointer"}
        onClick={() => {
          router.push("/configuration/datadog");
        }}
      >
        <Box
          borderColor={activeProvider === "datadog" ? "brandHighlight" : "neutralHighlight"}
          borderWidth={1}
          borderStyle={"solid"}
          padding={2}
          borderRadius={4}
        >
          <Image alt="Datadog" width={100} src={DatadogLogo} />
        </Box>
        {isDatadogConfigured && !isDatadogError && <div>icon</div>}
        {isDatadogError && <div>icon</div>}
      </Box>

      <Box as={"li"} marginTop={8}>
        <div>
          <Text color={"textNeutralSubdued"}>Coming Soon</Text>
        </div>
      </Box>
      <Box as={"li"}>
        <div>
          <Image alt="New Relic" width={100} src={NewRelicLogo} />
        </div>
      </Box>
      <Box as={"li"}>
        <div>
          <Image alt="Logz.io" width={100} src={LogzLogo} />
        </div>
      </Box>
    </Box>
  );
};
