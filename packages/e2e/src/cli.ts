import { Command } from "commander";
import { request, gql, GraphQLClient } from "graphql-request";
import {
  AuthorizeDocument,
  FetchAllAppsDocument,
  UninstallAppDocument,
} from "../generated/graphql";

const program = new Command();

program
  .name("e2e-util")
  .description("Perform operations for e2e test orchestration")
  .version("0.0.0");

program
  .command("remove-apps")
  .description("Removes all apps from provided env")
  .requiredOption("--email <type>", "Email for user with MANAGE_APPS permission")
  .requiredOption("--password <type>", "Password for the user")
  .requiredOption("--saleor <type>", "saleor api URL ending with /graphql/")
  .action(async (fields, options) => {
    const { email, password, saleor } = fields as {
      email: string;
      password: string;
      saleor: string;
    };

    const client = new GraphQLClient(saleor);

    const tokenResponse = await client
      .request(AuthorizeDocument, {
        email,
        password,
      })
      .catch((e) => {
        console.error("Failed with authorization, check params");
        console.error(e);
        process.exit(1);
      });

    const token = tokenResponse.tokenCreate?.token;

    if (!token) {
      console.error("Cant fetch token, check auth");
      process.exit(1);
    }

    client.setHeader("Authorization", `Bearer ${token}`);

    const allAppsResponse = await client.request(FetchAllAppsDocument).catch((e) => {
      console.error(e);
      process.exit(1);
    });

    console.log("Fetch apps");
    const apps = allAppsResponse.apps?.edges;

    if (!apps) {
      console.error("Can fetch apps");
      process.exit(1);
    }

    if (apps.length === 0) {
      console.log("No apps installed");
      process.exit(0);
    }

    const appsNodes = apps.map((appEdge) => appEdge.node);

    appsNodes.forEach((app) => {
      console.log(`[${app.id}] ${app.name}`);
    });

    await Promise.all(
      appsNodes.map((appNode) => {
        return client
          .request(UninstallAppDocument, { appId: appNode.id })

          .then((resp) => {
            if (resp && resp.appDelete?.app?.id) {
              console.log(`Uninstalled ${appNode.id}`);
            } else {
              throw new Error("Failed removing app");
            }

            return resp;
          })
          .catch((e) => {
            console.error(`Failed uninstalling ${appNode.id}`);
            return;
          });
      })
    );

    console.log("Removed apps");
  });

program.parse();
