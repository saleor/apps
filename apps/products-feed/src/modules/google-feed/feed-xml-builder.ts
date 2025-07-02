import { XMLBuilder } from "fast-xml-parser";

import { GoogleProxyItem } from "./types";

export class FeedXmlBuilder {
  private builder = new XMLBuilder({
    attributeNamePrefix: "@_",
    attributesGroupName: "@",
    textNodeName: "#text",
    ignoreAttributes: false,
    format: true,
    indentBy: "  ",
    suppressEmptyNode: false,
    preserveOrder: true,
  });

  /**
   * TODO:
   * - inject products as XML instead js objects to reduce memory
   */
  buildRootXml(params: {
    items: Array<{ item: GoogleProxyItem[] }>;
    channelData: GoogleProxyItem[];
  }) {
    const data = [
      {
        "?xml": [
          {
            "#text": "",
          },
        ],
        ":@": {
          "@_version": "1.0",
          "@_encoding": "utf-8",
        },
      },

      {
        rss: [
          {
            // @ts-ignore - This is "just an object" that is transformed to XML. I don't see good way to type it, other than "any"
            channel: channelData.concat(items),
          },
        ],
        ":@": {
          "@_xmlns:g": "http://base.google.com/ns/1.0",
          "@_version": "2.0",
        },
      },
    ];

    return this.builder.build(data);
  }
}
