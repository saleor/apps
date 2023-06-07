// @ts-check

/** @type {import("syncpack").RcFile} */
const config = {
  filter: "",
  indent: "  ",
  semverGroups: [],
  semverRange: "",
  dependencyTypes: ["dev", "overrides", "peer", "prod", "resolutions", "workspace"],
  /**
   * Order doesnt work in Syncpack, however lets still have it in the same format
   */
  sortAz: [
    "scripts",
    "contributors",
    "keywords",
    "dependencies",
    "devDependencies",
    "peerDependencies",
    "resolutions",
  ],
  sortFirst: ["name", "description", "version", "author"],
  source: ["apps/*/package.json", "packages/*/package.json", "package.json"],
  versionGroups: [],
};

module.exports = config;
