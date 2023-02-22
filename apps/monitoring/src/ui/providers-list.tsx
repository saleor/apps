import { makeStyles } from "@saleor/macaw-ui";
import Image from "next/image";
import DatadogLogo from "../assets/datadog/dd_logo_h_rgb.svg";
import NewRelicLogo from "../assets/new-relic/new_relic_logo_horizontal.svg";
import LogzLogo from "../assets/logzio/1584985593-blue-horizontal.svg";
import React from "react";
import { Section } from "./sections";
import { Typography } from "@material-ui/core";
import clsx from "clsx";
import { useRouter } from "next/router";
import { Done, Error } from "@material-ui/icons";
import { useConfigQuery } from "../../generated/graphql";

const useStyles = makeStyles((theme) => {
  return {
    item: {
      cursor: "pointer",
      display: "flex",
      marginBottom: 20,
      padding: "10px",
      justifyContent: "space-between",
      border: "1px solid transparent",
    },
    disabledItem: {
      filter: "grayscale(1)",
      opacity: 0.7,
      pointerEvents: "none",
      marginBottom: 20,
      padding: "10px",
    },
    selected: {
      border: `1px solid ${theme.palette.divider} !important`,
      borderRadius: 4,
    },
    list: {
      margin: 0,
      padding: 0,
      listStyle: "none",
    },
  };
});

type Props = {
  activeProvider: "datadog" | string | null;
};

export const IntegrationsList = ({ activeProvider }: Props) => {
  const styles = useStyles();
  const router = useRouter();
  const [queryData] = useConfigQuery();

  const isDatadogConfigured = queryData.data?.integrations.datadog?.credentials;
  const isDatadogError = queryData.data?.integrations.datadog?.error;

  return (
    <Section>
      <ul className={styles.list}>
        <li
          onClick={() => {
            router.push("/configuration/datadog");
          }}
          className={clsx(styles.item, {
            [styles.selected]: activeProvider === "datadog",
          })}
        >
          <div>
            <Image alt="Datadog" width={100} src={DatadogLogo} />
          </div>
          {isDatadogConfigured && !isDatadogError && (
            <div>
              <Done color="secondary" />
            </div>
          )}
          {isDatadogError && (
            <div>
              <Error color="error" />
            </div>
          )}
        </li>

        <li className={styles.disabledItem}>
          <div>
            <Typography variant="caption">Coming Soon</Typography>
          </div>
        </li>
        <li className={styles.disabledItem}>
          <div>
            <Image alt="New Relic" width={100} src={NewRelicLogo} />
          </div>
        </li>
        <li className={styles.disabledItem}>
          <div>
            <Image alt="Logz.io" width={100} src={LogzLogo} />
          </div>
        </li>
      </ul>
    </Section>
  );
};
