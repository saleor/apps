import Image from "next/image";
import DatadogLogo from "../assets/datadog/dd_logo_h_rgb.svg";
import NewRelicLogo from "../assets/new-relic/new_relic_logo_horizontal.svg";
import LogzLogo from "../assets/logzio/1584985593-blue-horizontal.svg";
import React from "react";
import { Section } from "./sections";
import clsx from "clsx";
import { useRouter } from "next/router";
import { useConfigQuery } from "../../generated/graphql";
import { Text } from "@saleor/macaw-ui/next";

type Props = {
  activeProvider: "datadog" | string | null;
};

export const IntegrationsList = ({ activeProvider }: Props) => {
  const router = useRouter();
  const [queryData] = useConfigQuery();

  const isDatadogConfigured = queryData.data?.integrations.datadog?.credentials;
  const isDatadogError = queryData.data?.integrations.datadog?.error;

  return (
    <Section>
      <ul>
        <li
          onClick={() => {
            router.push("/configuration/datadog");
          }}
          /*
           * className={clsx(styles.item, {
           *   [styles.selected]: activeProvider === "datadog",
           * })}
           */
        >
          <div>
            <Image alt="Datadog" width={100} src={DatadogLogo} />
          </div>
          {isDatadogConfigured && !isDatadogError && <div>icon</div>}
          {isDatadogError && <div>icon</div>}
        </li>

        <li>
          <div>
            <Text>Coming Soon</Text>
          </div>
        </li>
        <li>
          <div>
            <Image alt="New Relic" width={100} src={NewRelicLogo} />
          </div>
        </li>
        <li>
          <div>
            <Image alt="Logz.io" width={100} src={LogzLogo} />
          </div>
        </li>
      </ul>
    </Section>
  );
};
