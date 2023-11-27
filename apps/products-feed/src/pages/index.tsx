import { NextPage } from "next";
import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import { useEffect } from "react";
import { useIsMounted } from "usehooks-ts";
import { useRouter } from "next/router";
import { isInIframe } from "@saleor/apps-shared";
import { Text } from "@saleor/macaw-ui";

const IndexPage: NextPage = () => {
  const { appBridgeState } = useAppBridge();
  const isMounted = useIsMounted();
  const { replace } = useRouter();

  useEffect(() => {
    if (isMounted() && appBridgeState?.ready) {
      replace("/configuration");
    }
  }, [isMounted, appBridgeState?.ready]);

  if (isInIframe()) {
    return <Text color={"textNeutralSubdued"}>Loading...</Text>;
  }

  return (
    <div>
      <Text variant={"hero"} as={"h1"} marginBottom={5}>
        Saleor Product Feed
      </Text>
      <Text as={"p"}>This is Saleor App that allows product feed generation</Text>
      <Text as={"p"}>Install app in your Saleor instance and open in with Dashboard</Text>
    </div>
  );
};

export default IndexPage;
