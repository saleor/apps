// @ts-check

/** @type {import("syncpack").RcFile} */
const config = {
  filter: "",
  indent: "  ",
  semverGroups: [],
  semverRange: "",
  dependencyTypes: ["dev", "overrides", "peer", "prod", "resolutions"],
  sortAz: [
    "scripts",
    "contributors",
    "keywords",
    "dependencies",
    "devDependencies",
    "peerDependencies",
    "resolutions",
  ],
  sortFirst: ["name", "description", "version", "author", "scripts"],
  source: ["apps/*/package.json", "packages/*/package.json", "package.json"],
  versionGroups: [],
};

module.exports = config;
