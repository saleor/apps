import { describe, test, expect } from "vitest";
import { ConfigModel } from "./config-v3";

describe("configv3", () => {
  test("Constructs", () => {
    const instance = new ConfigModel();

    expect(instance).toBeDefined();
  });

  test("Serializes", () => {
    const instance = new ConfigModel({
      overrides: {
        usd: {
          channel: {
            slug: "usd",
          },
          address: {
            city: "Krakow",
            cityArea: "krowodrza",
            country: "poland",
            streetAddress1: "Some street",
            streetAddress2: "",
            postalCode: "12345",
            companyName: "Saleor",
            countryArea: "Malopolskie",
          },
        },
      },
    });

    expect(instance.serialize()).toEqual(
      '{"overrides":{"usd":{"channel":{"slug":"usd"},"address":{"city":"Krakow","cityArea":"krowodrza","country":"poland","streetAddress1":"Some street","streetAddress2":"","postalCode":"12345","companyName":"Saleor","countryArea":"Malopolskie"}}}}'
    );
  });

  test("Parses root schema", () => {
    const instance = ConfigModel.parse(
      '{"overrides":{"usd":{"channel":{"slug":"usd"},"address":{"city":"Krakow","cityArea":"krowodrza","country":"poland","streetAddress1":"Some street","streetAddress2":"","postalCode":"12345","companyName":"Saleor","countryArea":"Malopolskie"}}}}'
    );

    expect(instance.getOverridesArray()).toHaveLength(1);
    expect(instance.getOverridesArray()[0].channel.slug).toEqual("usd");
  });

  test("Appends override", () => {
    const instance = new ConfigModel();

    expect(instance.getOverridesArray()).toHaveLength(0);

    instance.addOverride("usd_USD", {
      city: "Krakow",
      cityArea: "krowodrza",
      country: "poland",
      streetAddress1: "Some street",
      streetAddress2: "",
      postalCode: "12345",
      companyName: "Saleor",
      countryArea: "Malopolskie",
    });

    expect(instance.getOverridesArray()).toHaveLength(1);
    expect(instance.getOverridesArray()[0].channel.slug).toEqual("usd_USD");
  });

  test("Removes override", () => {
    const instance = new ConfigModel({
      overrides: {
        usd: {
          channel: {
            slug: "usd",
          },
          address: {
            city: "Krakow",
            cityArea: "krowodrza",
            country: "poland",
            streetAddress1: "Some street",
            streetAddress2: "",
            postalCode: "12345",
            companyName: "Saleor",
            countryArea: "Malopolskie",
          },
        },
      },
    });

    instance.removeOverride("usd");

    expect(instance.getOverridesArray()).toHaveLength(0);

    expect(instance.serialize()).toEqual(`{"overrides":{}}`);
  });
});
