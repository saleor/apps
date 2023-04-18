import React, { PropsWithChildren } from "react";
import { makeStyles, PageTab, PageTabs } from "@saleor/macaw-ui";
import { useRouter } from "next/router";

const useStyles = makeStyles((theme) => ({
  appContainer: {
    marginTop: theme.spacing(3),
    marginLeft: theme.spacing(3),
  },
}));

type Props = PropsWithChildren<{}>;

export const ConfigurationPageBaseLayout = ({ children }: Props) => {
  const styles = useStyles();

  const router = useRouter();
  const tabs = [
    {
      key: "channels",
      label: "Channels",
      url: "/configuration",
    },
    { key: "categories", label: "Category mapping", url: "/categories" },
  ];

  const activePath = tabs.find((tab) => router.pathname === tab.url);

  const navigateToTab = (value: string) => {
    const redirectionUrl = tabs.find((tab) => tab.key === value)?.url;

    if (redirectionUrl) {
      router.push(redirectionUrl);
    }
  };

  return (
    <div className={styles.appContainer}>
      <PageTabs value={activePath} onChange={navigateToTab}>
        {tabs.map((tab) => (
          <PageTab key={tab.key} value={tab.key} label={tab.label} />
        ))}
      </PageTabs>
      {children}
    </div>
  );
};
