import { ShopDetailsEntry } from "./types";

export const shopDetailsToProxy = ({ title, storefrontUrl, description }: ShopDetailsEntry) => {
  // todo fix type
  const data: any[] = [
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
