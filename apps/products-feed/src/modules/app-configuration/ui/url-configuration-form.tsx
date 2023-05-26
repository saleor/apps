import { SellerShopConfig } from "../app-config";
import { useForm } from "react-hook-form";
import React from "react";
import { actions, useAppBridge } from "@saleor/app-sdk/app-bridge";
import { Input, Text, Button } from "@saleor/macaw-ui/next";

type Props = {
  channelSlug: string;
  channelName: string;
  channelID: string;
  onSubmit(data: SellerShopConfig["urlConfiguration"]): Promise<void>;
  initialData?: SellerShopConfig["urlConfiguration"] | null;
};

export const UrlConfigurationForm = (props: Props) => {
  const { register, handleSubmit } = useForm<SellerShopConfig["urlConfiguration"]>({
    defaultValues: props.initialData ?? undefined,
  });
  const { appBridge } = useAppBridge();

  const handleChannelNameClick = () => {
    appBridge?.dispatch(
      actions.Redirect({
        to: `/channels/${props.channelID}`,
      })
    );
  };

  return (
    <form
      onSubmit={handleSubmit((data, event) => {
        props.onSubmit(data);
      })}
    >
      <Text>
        Configure
        <strong onClick={handleChannelNameClick}>{` ${props.channelName} `}</strong>
        channel
      </Text>
      <Input label="Storefront home URL" {...register("storefrontUrl")} />
      <Input label="Storefront product URL template" {...register("productStorefrontUrl")} />
      <Button type="submit" variant="primary">
        Save channel configuration
      </Button>
    </form>
  );
};
