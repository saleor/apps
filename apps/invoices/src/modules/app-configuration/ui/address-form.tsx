import { SellerShopConfig } from "../app-config";
import { useForm } from "react-hook-form";

import React from "react";
import { actions, useAppBridge } from "@saleor/app-sdk/app-bridge";
import { Input, InputProps, Text, Button } from "@saleor/macaw-ui/next";

type Props = {
  channelSlug: string;
  channelName: string;
  channelID: string;
  onSubmit(data: SellerShopConfig["address"]): Promise<void>;
  initialData?: SellerShopConfig["address"] | null;
};

export const AddressForm = (props: Props) => {
  const { register, handleSubmit } = useForm<SellerShopConfig["address"]>({
    defaultValues: props.initialData ?? undefined,
  });

  const { appBridge } = useAppBridge();

  const CommonFieldProps: InputProps = {
    fullWidth: true,
  };

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
      <Text as="h3">
        Configure
        <span onClick={handleChannelNameClick}>{` ${props.channelName} `}</span>
        channel:
      </Text>
      <Input label="Company Name" {...CommonFieldProps} {...register("companyName")} />
      <Input label="Street Address 1" {...CommonFieldProps} {...register("streetAddress1")} />
      <Input {...CommonFieldProps} label="Street Address 2" {...register("streetAddress2")} />
      <div style={{ display: "grid", gap: 20, gridTemplateColumns: "1fr 2fr" }}>
        <Input {...CommonFieldProps} label="Postal Code" {...register("postalCode")} />
        <Input {...CommonFieldProps} label="City" {...register("city")} />
      </div>
      <Input {...CommonFieldProps} label="City Area" {...register("cityArea")} />
      <Input {...CommonFieldProps} label="Country" {...register("country")} />
      <Input label="Country Area" {...CommonFieldProps} {...register("countryArea")} />
      <Button type="submit" variant="primary">
        Save channel configuration
      </Button>
    </form>
  );
};
