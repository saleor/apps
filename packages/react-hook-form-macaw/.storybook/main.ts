import { mergeConfig } from "vite";

export default {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  // This causes a build error TODO:
  // staticDirs: [
  //   {
  //     from: "../public",
  //     to: "/assets",
  //   },
  //   "./public",
  // ],
  features: {
    storyStoreV7: true,
  },
  async viteFinal(config) {
    return mergeConfig(config, {
      plugins: [require("@vanilla-extract/vite-plugin").vanillaExtractPlugin()],
    });
  },
};
