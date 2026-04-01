/* eslint-disable no-console */
import { decrypt, encrypt } from "@saleor/app-sdk/settings-manager";
import { createGraphQLClient } from "@saleor/apps-shared/create-graphql-client";
import { collectFallbackSecretKeys } from "@saleor/apps-shared/fallback-secret-keys";
import { gql } from "urql";

import { env } from "@/env";
import { saleorApp } from "saleor-app";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");

const FetchAppDetailsQuery = gql`
  query FetchAppDetails {
    app {
      id
      privateMetadata {
        key
        value
      }
    }
  }
`;

const UpdateAppMetadataMutation = gql`
  mutation UpdateAppMetadata($id: ID!, $input: [MetadataInput!]!) {
    updatePrivateMetadata(id: $id, input: $input) {
      item {
        privateMetadata {
          key
          value
        }
      }
    }
  }
`;

const main = async () => {
  const secretKey = env.SECRET_KEY;
  const fallbackKeys = collectFallbackSecretKeys(env);

  if (fallbackKeys.length === 0) {
    console.error(
      "No FALLBACK_SECRET_KEY_* env vars set. Set old key(s) as FALLBACK_SECRET_KEY_1/2/3 to rotate from.",
    );
    process.exit(1);
  }

  console.log(`Starting secret key rotation${dryRun ? " (DRY RUN)" : ""}`);
  console.log(`Fallback keys configured: ${fallbackKeys.length}`);

  const allInstallations = await saleorApp.apl.getAll().catch((err) => {
    console.error("Failed to fetch installations from APL:", err);
    process.exit(1);
  });

  console.log(`Found ${allInstallations.length} installation(s)`);

  let totalRotated = 0;
  let totalSkipped = 0;
  let totalFailed = 0;

  for (const { token, saleorApiUrl } of allInstallations) {
    console.log(`\nProcessing installation: ${saleorApiUrl}`);

    const client = createGraphQLClient({ saleorApiUrl, token });

    const { data, error } = await client
      .query(FetchAppDetailsQuery, {}, { requestPolicy: "network-only" })
      .toPromise();

    if (error || !data?.app) {
      console.error(`  Failed to fetch metadata: ${error?.message ?? "No app data"}`);
      totalFailed++;
      continue;
    }

    const appId = data.app.id as string;
    const metadata = data.app.privateMetadata as Array<{ key: string; value: string }>;

    console.log(`  App ID: ${appId}`);
    console.log(`  Metadata entries: ${metadata.length}`);

    const toUpdate: Array<{ key: string; value: string }> = [];

    for (const entry of metadata) {
      // Try decrypting with current key — already rotated
      try {
        decrypt(entry.value, secretKey);
        console.log(`  [${entry.key}] Already encrypted with current key, skipping`);
        totalSkipped++;
        continue;
      } catch {
        // Not encrypted with current key, try fallbacks
      }

      // Try decrypting with fallback keys
      let decryptedValue: string | null = null;

      for (let i = 0; i < fallbackKeys.length; i++) {
        try {
          decryptedValue = decrypt(entry.value, fallbackKeys[i]);
          console.log(`  [${entry.key}] Decrypted using fallback key ${i + 1}`);
          break;
        } catch {
          // continue to next fallback
        }
      }

      if (decryptedValue === null) {
        console.error(`  [${entry.key}] Failed to decrypt with any key, skipping`);
        totalFailed++;
        continue;
      }

      // Re-encrypt with current key
      const reEncryptedValue = encrypt(decryptedValue, secretKey);

      toUpdate.push({ key: entry.key, value: reEncryptedValue });
      console.log(`  [${entry.key}] Re-encrypted with current key`);
    }

    if (toUpdate.length === 0) {
      console.log(`  No entries need rotation`);
      continue;
    }

    if (dryRun) {
      console.log(`  DRY RUN: Would update ${toUpdate.length} entries`);
      totalRotated += toUpdate.length;
      continue;
    }

    const { error: mutationError } = await client
      .mutation(UpdateAppMetadataMutation, {
        id: appId,
        input: toUpdate,
      })
      .toPromise();

    if (mutationError) {
      console.error(`  Failed to save metadata: ${mutationError.message}`);
      totalFailed += toUpdate.length;
    } else {
      console.log(`  Successfully rotated ${toUpdate.length} entries`);
      totalRotated += toUpdate.length;
    }
  }

  console.log(`\n--- Summary ---`);
  console.log(`Rotated: ${totalRotated}${dryRun ? " (dry run)" : ""}`);
  console.log(`Skipped (already current): ${totalSkipped}`);
  console.log(`Failed: ${totalFailed}`);
  console.log(`Secret key rotation complete`);
};

main().catch(console.error);
