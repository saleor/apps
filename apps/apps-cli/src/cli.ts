#!/usr/bin/env node

import chalk from "chalk";
import { createRequire } from "module";
import semver from "semver";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { installAppCommand } from "./commands/install-app-command";
import { uninstallAppCommand } from "./commands/uninstall-app-command";
import "dotenv/config";
import { webhooksCommand } from "./commands/webhooks-command";

const require = createRequire(import.meta.url);
const pkg = require("../package.json");

if (!semver.satisfies(process.versions.node, ">= 18")) {
  console.error(`${chalk.red("ERROR")}: CLI requires Node.js 18.x or later`);
  process.exit(1);
}

const parser = yargs(hideBin(process.argv))
  .scriptName("apps-cli")
  .version(pkg.version)
  .alias("V", "version")
  .usage("Usage: $0 <command> [options]")
  .config({
    instanceUrl: process.env.INSTANCE_URL,
    userEmail: process.env.USER_EMAIL,
    userPassword: process.env.USER_PASSWORD,
  })
  .command(
    "installApp",
    "Install an app on a Saleor instance based on provided manifest.",
    (yargs) => {
      return yargs
        .option("instanceUrl", {
          type: "string",
          desc: "URL to the Saleor GraphQL API. Example: https://example.com/graphql/",
          demandOption: true,
        })
        .option("userEmail", {
          type: "string",
          desc: "Dashboard user email",
          demandOption: true,
        })
        .option("userPassword", {
          type: "string",
          desc: "Dashboard user password",
          demandOption: true,
        })
        .option("manifestUrl", {
          type: "string",
          desc: "URL to the app manifest. Example: https://example.com/api/manifest",
          demandOption: true,
        });
    },
    (argv) => {
      installAppCommand({
        instanceUrl: argv.instanceUrl,
        userEmail: argv.userEmail,
        userPassword: argv.userPassword,
        manifestUrl: argv.manifestUrl,
      });
    }
  )
  .command(
    "uninstallApp",
    "If no filter is passed, CLI will display a list of installed apps and ask which one to remove. Otherwise all apps matching the filter will be removed.",
    (yargs) => {
      return yargs
        .option("instanceUrl", {
          type: "string",
          desc: "URL to the Saleor GraphQL API",
          demandOption: true,
        })
        .option("userEmail", {
          type: "string",
          desc: "Dashboard user email",
          demandOption: true,
        })
        .option("userPassword", {
          type: "string",
          desc: "Dashboard user password",
          demandOption: true,
        })
        .option("manifestUrl", {
          type: "string",
          desc: "Url to the app manifest which you want to remove",
        })
        .option("appName", {
          type: "string",
          desc: "Name of the app to remove",
        })
        .option("appId", {
          type: "string",
          desc: "If of the app to remove",
        })
        .option("all", {
          type: "boolean",
          default: false,
          desc: "Will remove all apps",
        })
        .option("force", {
          type: "boolean",
          default: false,
          desc: "No confirmation",
        });
    },
    (argv) => {
      uninstallAppCommand({
        instanceUrl: argv.instanceUrl,
        userEmail: argv.userEmail,
        userPassword: argv.userPassword,
        manifestUrl: argv.manifestUrl,
        appId: argv.appId,
        all: argv.all,
        force: argv.force,
      });
    }
  )
  .command(
    "webhooks",
    "Print webhook details of installed app.",
    (yargs) => {
      return yargs
        .option("instanceUrl", {
          type: "string",
          desc: "URL to the Saleor GraphQL API. Example: https://example.com/graphql/",
          demandOption: true,
        })
        .option("userEmail", {
          type: "string",
          desc: "Dashboard user email",
          demandOption: true,
        })
        .option("userPassword", {
          type: "string",
          desc: "Dashboard user password",
          demandOption: true,
        });
    },
    (argv) => {
      webhooksCommand({
        instanceUrl: argv.instanceUrl,
        userEmail: argv.userEmail,
        userPassword: argv.userPassword,
      });
    }
  )
  .demandCommand(1, "You need at least one command before moving on")
  .alias("h", "help")
  .wrap(null);

try {
  await parser.parse();
} catch (error) {
  console.log("parser error");
}
