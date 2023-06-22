// @ts-check
/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
const config = {
  _comment:
    "This config was generated using 'stryker init'. Please take a look at: https://stryker-mutator.io/docs/stryker-js/configuration/ for more information.",
  packageManager: "pnpm",
  reporters: ["html", "clear-text", "progress"],
  testRunner: "vitest",
  vitest: {
    configFile: "vitest.config.ts",
  },
  checkers: ["typescript"],
  tsconfigFile: "tsconfig.json",
  typescriptChecker: {
    prioritizePerformanceOverAccuracy: true,
  },
  logLevel: "error",
  plugins: ["@stryker-mutator/vitest-runner", "@stryker-mutator/typescript-checker"],
};

// eslint-disable-next-line import/no-default-export
export default config;
