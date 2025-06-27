import { XMLBuilder, XMLParser } from "fast-xml-parser";

export const xmlBuilder = new XMLBuilder({
  attributeNamePrefix: "@_",
  attributesGroupName: "@",
  textNodeName: "#text",
  ignoreAttributes: false,
  format: true,
  indentBy: "  ",
  suppressEmptyNode: false,
  preserveOrder: true,
});

export const xmlParser = new XMLParser({
  attributeNamePrefix: "@_",
  attributesGroupName: "@",
  textNodeName: "#text",
  ignoreAttributes: false,
  preserveOrder: true,
});
