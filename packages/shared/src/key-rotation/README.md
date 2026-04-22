# SECRET_KEY rotation

Shared infrastructure for rotating the `SECRET_KEY` that each Saleor app uses to encrypt configuration data

## How rotation works

Rotation uses two env vars:

| Var | Role during rotation |
|------|----------------------|
| `SECRET_KEY` | The **current** key. Used only to decrypt existing data. |
| `NEW_SECRET_KEY` | The **target** key. Used to encrypt all new writes. |


When `NEW_SECRET_KEY` is set:

- New writes are encrypted with `NEW_SECRET_KEY`.
- Reads try `NEW_SECRET_KEY` first, then fall back to `SECRET_KEY` (so already-encrypted data still decrypts).
- The rotation script re-encrypts stored data from `SECRET_KEY` → `NEW_SECRET_KEY`.

After rotation completes, swap env vars so `SECRET_KEY` holds the new value and remove `NEW_SECRET_KEY`.

## Step-by-step runbook

1. **Generate a new key locally** and store it in a password manager you trust:

   ```bash
   openssl rand -hex 32
   ```

2. **Add `NEW_SECRET_KEY` to the deployment** with the value from step 1.
   Target: Production + Preview.
   On Vercel, use the **Encrypted** type — **not** Sensitive. Sensitive values cannot be read again
3. **Redeploy.** The app now encrypts new writes with `NEW_SECRET_KEY` and still decrypts legacy data via `SECRET_KEY` fallback.
4. **Run the rotation script** for the app you are rotating. The script re-encrypts every stored
   encrypted field (DynamoDB rows, Saleor app metadata, etc.) from `SECRET_KEY` to `NEW_SECRET_KEY`.

   Dry run first:

   ```bash
   pnpm rotate-secret-key:dry-run
   ```

   Then real run:

   ```bash
   pnpm rotate-secret-key
   ```

   The script is idempotent and resumable — re-running it after a failure or partial completion is safe.
   The runner also detects concurrent writes in DynamoDB and leaves those rows for the next run instead of overwriting them.

5. **Verify the rotation** by inspecting the script's summary output. `Rotated` should cover every row
   that was previously encrypted with the old key; `Failed` should be `0`.
6. **Swap env vars to finalise:**
   - Delete the old `SECRET_KEY`.
   - Re-add `SECRET_KEY` with the value of `NEW_SECRET_KEY` (the value you still have locally).
     Use **Encrypted** type.
   - Remove `NEW_SECRET_KEY`.
7. **Redeploy.** Steady state restored. `NEW_SECRET_KEY` is unset again; reads and writes both use the
   new `SECRET_KEY`.

## Error: `NEW_SECRET_KEY must be set to run rotation`

The script guards against accidental runs without a target. Set `NEW_SECRET_KEY` to the new key value
and retry.

## Error: `No fallback keys configured`

Runner received `fallbackKeys: []`. Indicates a script misconfiguration - every
`apps/<app>/scripts/rotate-secret-key.ts` in this repo uses `resolveRotationSourceKeys(env)` which
always returns `[env.SECRET_KEY]`.
