import { AddressResolutionModel } from "avatax/lib/models/AddressResolutionModel";
import { AvataxAddressResolutionProcessor } from "./avatax-address-resolution-processor";
import { describe, expect, it } from "vitest";
import { ResolutionQuality } from "avatax/lib/enums/ResolutionQuality";
import { JurisdictionType } from "avatax/lib/enums/JurisdictionType";

const mockedSuccessResponse: AddressResolutionModel = {
  address: {
    line1: "20 COOPER ST",
    city: "NEW YORK",
    region: "NY",
    country: "US",
    postalCode: "10034",
  },
  validatedAddresses: [
    {
      addressType: "UnknownAddressType",
      line1: "20 COOPER ST",
      line2: "",
      line3: "",
      city: "NEW YORK",
      region: "NY",
      country: "US",
      postalCode: "10034",
      latitude: 40.86758,
      longitude: -73.924502,
    },
  ],
  coordinates: {
    latitude: 40.86758,
    longitude: -73.924502,
  },
  resolutionQuality: ResolutionQuality.Intersection,
  taxAuthorities: [
    {
      avalaraId: "42",
      jurisdictionName: "NEW YORK",
      jurisdictionType: JurisdictionType.State,
      signatureCode: "BFEQ",
    },
    {
      avalaraId: "359071",
      jurisdictionName: "METROPOLITAN COMMUTER TRANSPORTATION DISTRICT",
      jurisdictionType: JurisdictionType.Special,
      signatureCode: "BGJP",
    },
    {
      avalaraId: "2001053475",
      jurisdictionName: "NEW YORK CITY",
      jurisdictionType: JurisdictionType.City,
      signatureCode: "EHTG",
    },
  ],
};

const mockedUnresolvedResponse: AddressResolutionModel = {
  address: {
    line1: "42069 COOPER ST  ",
    city: "NEW YORK",
    region: "NY",
    country: "US",
    postalCode: "10034",
  },
  validatedAddresses: [
    {
      addressType: "UnknownAddressType",
      line1: "42069 COOPER ST",
      line2: "",
      line3: "",
      city: "NEW YORK",
      region: "NY",
      country: "US",
      postalCode: "10034",
      latitude: 40.866728,
      longitude: -73.921445,
    },
  ],
  coordinates: {
    latitude: 40.866728,
    longitude: -73.921445,
  },
  resolutionQuality: ResolutionQuality.Intersection,
  messages: [
    {
      summary: "The address number is out of range",
      details:
        "The address was found but the street number in the input address was not between the low and high range of the post office database.",
      refersTo: "Address.Line0",
      severity: "Error",
      source: "Avalara.AvaTax.Common",
    },
  ],
};

const processor = new AvataxAddressResolutionProcessor();

describe("AvataxAddressResolutionProcessor", () => {
  describe("resolveAddressResolutionMessage", () => {
    it("returns success when no messages", () => {
      const result = processor.resolveAddressResolutionMessage(mockedSuccessResponse);

      expect(result).toEqual({
        type: "success",
        message: "The address was resolved successfully.",
      });
    });
    it("returns info when messages", () => {
      const result = processor.resolveAddressResolutionMessage(mockedUnresolvedResponse);

      expect(result).toEqual({
        type: "info",
        message: "The address number is out of range",
      });
    });
  });
  describe("extractSuggestionsFromResponse", () => {
    it("throws an error when no address", () => {
      expect(() => processor.extractSuggestionsFromResponse({} as any)).toThrowError(
        "No address found",
      );
    });
    it("returns suggestions when address", () => {
      const result = processor.extractSuggestionsFromResponse(mockedSuccessResponse);

      expect(result).toEqual({
        street: "20 COOPER ST",
        city: "NEW YORK",
        state: "NY",
        country: "US",
        zip: "10034",
      });
    });
  });
});
