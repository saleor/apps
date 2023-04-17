require("dotenv").config();

import { expect, test } from "@playwright/test";
import { createClient } from "urql";
import { AuthorizeDocument, InstallAppDocument, JobStatusEnum } from "../generated/graphql";

const saleorUrl = process.env.E2E_TAXES_SALEOR_API_URL!;
const email = process.env.E2E_TAXES_ADMIN_USER_EMAIL!;
const password = process.env.E2E_TAXES_ADMIN_USER_PASSWORD!;
const testedAppManifest = process.env.E2E_TAXES_TESTED_APP_MANIFEST!;

const client = createClient({
  url: saleorUrl,
});

let token = "";

test.describe("Taxes Installation @taxes", () => {
  test.beforeAll(async () => {
    const tokenResp = await client
      .mutation(AuthorizeDocument, {
        email,
        password,
      })
      .toPromise();

    token = tokenResp.data!.tokenCreate!.token as string;

    return expect(token).toBeDefined();
  });

  /**
   * Should it be taxes/e2e or maybe move it to packages/e2e and run all apps installations there?
   * Having a package will be hard to orchestrate when tests should run
   */
  test("Installs app via Manifest", async () => {
    const installationResp = await client
      .mutation(
        InstallAppDocument,
        { manifestUrl: testedAppManifest },
        {
          fetchOptions: {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        }
      )
      .toPromise();

    expect(installationResp.data!.appInstall!.appInstallation!.status).toBe(JobStatusEnum.Pending);
    expect(installationResp.data!.appInstall!.appInstallation!.id).toEqual(expect.any(String));

    // todo - fetch installed app after job completed
  });

  test("Fetches manifest", async ({ request }) => {
    expect(await request.get(testedAppManifest!).then((r) => r.json())).toMatchObject(
      expect.objectContaining({
        name: expect.any(String),
      })
    );
  });
});
