import { actions, useAppBridge } from "@saleor/app-sdk/app-bridge";
import { Text } from "@saleor/macaw-ui/next";
import { Section } from "../../ui/app-section";
import { ChannelList } from "./channel-list";

const Intro = () => {
  const appBridge = useAppBridge();

  const redirectToTaxes = () => {
    appBridge.appBridge?.dispatch(actions.Redirect({ to: "/taxes/channels" }));
  };

  return (
    <Section.Description
      title="Available channels"
      description={
        <>
          This table displays all the channels configured to use the tax app as the tax calculation
          method.
          <br />
          <br />
          You can change the tax configuration method for each channel in the{" "}
          <Text
            transition={"ease"}
            variant={"bodyStrong"}
            cursor={"pointer"}
            color={{
              default: "text3Decorative",
              hover: "text1Decorative",
            }}
            onClick={redirectToTaxes}
          >
            Configuration → Taxes
          </Text>{" "}
          view.
        </>
      }
    />
  );
};

export const ChannelSection = () => {
  return (
    <>
      <Intro />
      <ChannelList />
    </>
  );
};
