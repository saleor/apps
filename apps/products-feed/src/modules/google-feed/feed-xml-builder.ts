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

  buildItemsChunk(items: Array<{ item: GoogleProxyItem[] }>) {
    return this.builder.build(items);
  }

  injectProductsString(rootXml: string, productsXml: string) {
    return rootXml.replace("</channel>", productsXml + "\n</channel>");
  }

  buildRootXml({ channelData }: { channelData: GoogleProxyItem[] }) {
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
            channel: channelData,
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
