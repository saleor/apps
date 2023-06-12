import { AddressResolutionModel } from "avatax/lib/models/AddressResolutionModel";
import { describe, expect, it } from "vitest";
import { AvataxValidationResponseResolver } from "./avatax-validation-response-resolver";
import { ResolutionQuality } from "avatax/lib/enums/ResolutionQuality";
import { JurisdictionType } from "avatax/lib/enums/JurisdictionType";

const mockFailedValidationResponse: AddressResolutionModel = {
  address: {
    line1: "2000 Main Street",
    city: "Irvine",
    region: "CA",
    country: "US",
    postalCode: "92614",
  },
  coordinates: {
    latitude: 33.684884,
    longitude: -117.851321,
  },
  resolutionQuality: ResolutionQuality.Intersection,
  taxAuthorities: [
    {
      avalaraId: "AGAM",
      jurisdictionName: "CALIFORNIA",
      jurisdictionType: JurisdictionType.State,
      signatureCode: "AGAM",
    },
  ],
  messages: [
    {
      summary: "The address is not deliverable.",
      details:
        "The physical location exists but there are no homes on this street. One reason might be railroad tracks or rivers running alongside this street, as they would prevent construction of homes in this location.",
      refersTo: "address",
      severity: "Error",
      source: "Avalara.AvaTax.Services.Address",
    },
  ],
};

const mockSuccessfulValidationResponse: AddressResolutionModel = {
  ...mockFailedValidationResponse,
  messages: [],
};

describe("AvataxValidationResponseResolver", () => {
  const responseResolver = new AvataxValidationResponseResolver();

  it("should throw error when messages", () => {
    expect(() => responseResolver.resolve(mockFailedValidationResponse)).toThrow();
  });

  it("should not throw error when no messages", () => {
    expect(() => responseResolver.resolve(mockSuccessfulValidationResponse)).not.toThrow();
  });

  it("should not return anything when no messages", () => {
    expect(responseResolver.resolve(mockSuccessfulValidationResponse)).toBeUndefined();
  });
});
