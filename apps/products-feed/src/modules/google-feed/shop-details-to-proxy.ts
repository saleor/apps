import { GoogleProxyItem, ShopDetailsEntry } from "./types";

// todo test
export const shopDetailsToProxy = ({ title, storefrontUrl, description }: ShopDetailsEntry) => {
  const data: GoogleProxyItem[] = [
    {
      title: [
        {
          "#text": title,
        },
      ],
    },
    {
      link: [
        {
          "#text": storefrontUrl,
        },
      ],
    },
  ];

  if (description) {
    data.push({
      description: [
        {
          "#text": description,
        },
      ],
    });
  }

  return data;
};
