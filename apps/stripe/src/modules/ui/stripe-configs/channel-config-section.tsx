import { actions, useAppBridge, useAuthenticatedFetch } from "@saleor/app-sdk/app-bridge";
import { EmptyConfigs, Layout } from "@saleor/apps-ui";
import { Skeleton, Text } from "@saleor/macaw-ui";
import { useRouter } from "next/router";
import { useEffect } from "react";

import { trpcClient } from "@/modules/trpc/trpc-client";
import { StripeConfigsList } from "@/modules/ui/stripe-configs/stripe-configs-list";

export const ChannelConfigSection = () => {
  const { data, error, refetch } = trpcClient.appConfig.getStripeConfigsList.useQuery();
  const router = useRouter();
  const fetch = useAuthenticatedFetch();
  const { appBridgeState, appBridge } = useAppBridge();

  const onConnect = async (configId: string) => {
    // can / should be trpc
    const res = await fetch("/api/connect/create", {
      method: "POST",
      body: JSON.stringify({ configId }),
    });

    const result = await res.json();

    const qs = new URLSearchParams({
      account: result.accountId as string,
      configId: configId,
      saleorApiUrl: appBridgeState?.saleorApiUrl as string,
    });

    const base = new URL(window.location.href)

    // attach token
    appBridge?.dispatch(
      actions.Redirect({
        to: base.origin +  "/connect/link?" + qs.toString(),
        newContext: true,
      }),
    );
  };

  useEffect(() => {
    void refetch();
  }, []);

  if (error) {
    return <Text color="critical1">Error fetching config: {error.message}</Text>;
  }

  if (data && data.length === 0) {
    return <EmptyConfigs onConfigurationAdd={() => router.push("/config/new")} />;
  }

  if (data && data.length > 0) {
    return <StripeConfigsList onConnect={onConnect} configs={data} />;
  }

  return (
    <Layout.AppSectionCard footer={<Skeleton />}>
      <Skeleton />
    </Layout.AppSectionCard>
  );
};
