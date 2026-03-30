# Scripts

## Bulk delete old Vercel deployments

`list-old-deployments.py` fetches all deployments for a given app via Vercel API and writes UIDs of non-current-production deployments to `old-deployment-uids.txt`.

### Prerequisites

- Vercel CLI installed and authenticated (`vercel login`)
- Access to the `saleorcommerce` scope

### Usage

1. Edit `APP_NAME` in the script

2. Run the script to generate the list:

   ```bash
   python3 scripts/list-old-deployments.py
   ```

   This prints a table of all old deployments and writes their UIDs to `old-deployment-uids.txt` (one per line).

3. Delete in batches of 50 (Vercel will prompt for confirmation and skip protected deployments):

   ```bash
   vercel remove $(head -50 old-deployment-uids.txt) --scope saleorcommerce
   ```

4. After each batch, remove the processed lines:

   ```bash
   sed -i '' '1,50d' old-deployment-uids.txt
   ```

5. Repeat steps 3-4 until the file is empty. Check remaining count with:

   ```bash
   wc -l < old-deployment-uids.txt
   ```

### Notes

- Vercel performs safe deletion — it will skip the current production deployment and any aliased deployments automatically.
- If Vercel deletes fewer than 50 in a batch, the skipped ones remain in the file. You can either re-run the script to regenerate a fresh list, or skip ahead with `sed -i '' '1,50d'`.
- To skip the first N lines and get the next 50: `sed -n '51,100p' old-deployment-uids.txt`
