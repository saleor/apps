# Scripts

## Bulk delete old Vercel deployments

`list-old-deployments.py` fetches all deployments for a given app via the Vercel API and writes UIDs of non-current-production deployments to `old-deployment-uids.txt`.

### Prerequisites

- Vercel CLI installed and authenticated (`vercel login`)
- Access to the `saleorcommerce` scope

### Usage

1. Edit `APP_NAME` in the script to the target app.

2. Run the script to generate the list:

   ```bash
   python3 scripts/list-old-deployments.py
   ```

   This prints a table of all old deployments and writes their UIDs to `old-deployment-uids.txt` (one per line).

3. Review the file and remove any deployments you want to keep (e.g. staging aliases):

   ```bash
   vim old-deployment-uids.txt
   ```

4. Delete all remaining deployments (Vercel will show the list and ask for confirmation):

   ```bash
   vercel remove $(cat old-deployment-uids.txt) --scope saleorcommerce
   ```

   If there are too many for a single command, delete in batches of 50:

   ```bash
   vercel remove $(head -50 old-deployment-uids.txt) --scope saleorcommerce
   # After confirming, remove processed lines:
   sed -i '' '1,50d' old-deployment-uids.txt
   # To skip ahead (e.g. next 50 starting at line 51):
   vercel remove $(sed -n '51,100p' old-deployment-uids.txt) --scope saleorcommerce
   ```

5. Re-run the script to verify everything was cleaned up:

   ```bash
   python3 scripts/list-old-deployments.py
   ```

### Notes

- Vercel performs safe deletion — it will skip the current production deployment automatically.
- Vercel warns about alias removals before confirming — review these warnings before accepting.
- The `-s` flag skips the confirmation prompt (`vercel remove ... -s`). Use `-y` to auto-confirm.
