import { describe, it, expect } from "vitest";
import { AppConfigContainer } from "./app-config-container";
import { AppConfig, SellerShopConfig } from "./app-config";

const getDefaultAddressData = (): SellerShopConfig["address"] => ({
  city: "",
  cityArea: "",
  companyName: "Saleor",
  country: "",
  countryArea: "",
  postalCode: "",
  streetAddress1: "",
  streetAddress2: "",
});

describe("AppConfigContainer", () => {
  describe("Get address from config", () => {
    it("Gets address if exists", () => {
      expect(
        AppConfigContainer.getChannelAddress({
          shopConfigPerChannel: {
            channel: {
              address: getDefaultAddressData(),
            },
          },
        })("channel")
      ).toEqual(
        expect.objectContaining({
          companyName: "Saleor",
        })
      );
    });

    it("Returns null if entire config is null", () => {
      expect(AppConfigContainer.getChannelAddress(null)("channel")).toEqual(null);
    });
  });

  describe("Set address to config per slug of the channel", () => {
    it("Will create entire config object if initially was null", () => {
      const newConfig = AppConfigContainer.setChannelAddress(null)("channel")(
        getDefaultAddressData()
      );

      expect(newConfig).toEqual({
        shopConfigPerChannel: expect.objectContaining({
          channel: expect.objectContaining({
            address: expect.objectContaining({ companyName: "Saleor" }),
          }),
        }),
      });
    });

    it("Will preserve another existing config for another channel after setting a new one", () => {
      const config: AppConfig = {
        shopConfigPerChannel: {
          c1: {
            address: {
              ...getDefaultAddressData(),
              companyName: "Mirumee",
            },
          },
        },
      };

      const newConfig = AppConfigContainer.setChannelAddress(config)("c2")(getDefaultAddressData());

      expect(newConfig.shopConfigPerChannel.c1.address.companyName).toEqual("Mirumee");
      expect(newConfig.shopConfigPerChannel.c2.address.companyName).toEqual("Saleor");
    });
  });
});
