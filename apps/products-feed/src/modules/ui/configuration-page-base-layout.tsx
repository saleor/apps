import React, { PropsWithChildren } from "react";

import { useRouter } from "next/router";

type Props = PropsWithChildren<{}>;

export const ConfigurationPageBaseLayout = ({ children }: Props) => {
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
    <div>
      <div>
        {/*{tabs.map((tab) => (*/}
        {/*  <div key={tab.key} value={tab.key} label={tab.label} />*/}
        {/*))}*/}
      </div>
      {children}
    </div>
  );
};
