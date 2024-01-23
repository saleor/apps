export const setup = () => {
  /**
   * Overwrite Time Zone so local and remote machines don't break tests on dates
   * TODO: Make it global for all packages
   */
  // eslint-disable-next-line turbo/no-undeclared-env-vars
  process.env.TZ = "UTC";
};
