import { describe, expect, it } from "vitest";
import { metadataToMailchimpTags } from "./metadata-to-mailchimp-tags";
import { CustomerFragment } from "../../../generated/graphql";

const fragmentBase: CustomerFragment = {
  id: "",
  email: "",
  __typename: "User",
  firstName: "",
  lastName: "",
  privateMetadata: [],
};

describe("metadata-to-mailchimp-tags", () => {
  it("Returns [] if desired metadata doesnt exist", () => {
    expect(
      metadataToMailchimpTags({
        ...fragmentBase,
        privateMetadata: [],
      })
    ).toEqual([]);
  });

  it("Returns parsed array of tags if exist in mailchimp_tags metadata key", () => {
    expect(
      metadataToMailchimpTags({
        ...fragmentBase,
        privateMetadata: [
          {
            key: "mailchimp_tags",
            value: JSON.stringify(["foo", "bar"]),
          },
        ],
      })
    ).toEqual(["foo", "bar"]);
  });

  it("Returns [] if metadata is {} (wrong value)", () => {
    expect(
      metadataToMailchimpTags({
        ...fragmentBase,
        privateMetadata: [
          {
            key: "mailchimp_tags",
            value: JSON.stringify({}),
          },
        ],
      })
    ).toEqual([]);
  });
});
