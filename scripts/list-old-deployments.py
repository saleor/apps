#!/usr/bin/env python3
"""List all Vercel deployments for saleor-app-smtp that are older than the current production deployment."""

import json
import subprocess
import sys
from datetime import datetime, timezone

APP_NAME = "saleor-app-products-feed"
SCOPE = "saleorcommerce"


def vercel_api(endpoint: str) -> dict:
    result = subprocess.run(
        ["vercel", "api", endpoint, "--scope", SCOPE],
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        print(f"Error calling vercel api: {result.stderr}", file=sys.stderr)
        sys.exit(1)
    return json.loads(result.stdout)


def fetch_all_deployments() -> list[dict]:
    """Fetch all deployments, paginating through all pages."""
    all_deps = []
    next_ts = None

    while True:
        url = f"/v6/deployments?app={APP_NAME}&limit=100"
        if next_ts:
            url += f"&until={next_ts}"

        data = vercel_api(url)
        deps = data.get("deployments", [])
        pagination = data.get("pagination", {})

        all_deps.extend(deps)
        print(
            f"  Fetched {len(deps)} deployments (total: {len(all_deps)})",
            file=sys.stderr,
        )

        next_ts = pagination.get("next")
        if not next_ts or len(deps) == 0:
            break

    return all_deps


def format_ts(ts: int | None) -> str:
    if not ts:
        return "N/A"
    return datetime.fromtimestamp(ts / 1000, tz=timezone.utc).strftime("%Y-%m-%d %H:%M")


def main():
    print("Fetching all deployments...", file=sys.stderr)
    all_deps = fetch_all_deployments()

    # Find current production: newest deployment with target=production and readySubstate=PROMOTED
    prod_deps = [
        d
        for d in all_deps
        if d.get("target") == "production" and d.get("readySubstate") == "PROMOTED"
    ]
    if not prod_deps:
        print("ERROR: No current production deployment found!", file=sys.stderr)
        sys.exit(1)

    current_prod = max(prod_deps, key=lambda d: d["created"])
    print("\nCurrent production deployment:", file=sys.stderr)
    print(f"  URL: {current_prod['url']}", file=sys.stderr)
    print(f"  UID: {current_prod['uid']}", file=sys.stderr)
    print(f"  Created: {format_ts(current_prod['created'])}", file=sys.stderr)
    sha = current_prod.get("meta", {}).get("githubCommitSha", "N/A")
    print(f"  Commit: {sha[:8]}", file=sys.stderr)

    # Filter: everything except current production, not already soft-deleted
    old_deps = [
        d
        for d in all_deps
        if d["uid"] != current_prod["uid"] and not d.get("softDeletedByRetention")
    ]

    print(
        f"\nOld deployments to delete: {len(old_deps)} (out of {len(all_deps)} total)\n",
        file=sys.stderr,
    )

    # Print table to stdout
    header = f"{'URL':<60} {'Target':<12} {'State':<10} {'Commit':<10} {'Branch':<20} {'Creator':<20} {'Created':<18} {'Message'}"
    print(header)
    print("-" * len(header))

    for d in sorted(old_deps, key=lambda x: x["created"], reverse=True):
        meta = d.get("meta", {})
        sha = meta.get("githubCommitSha", "")[:8]
        ref = meta.get("githubCommitRef", "")
        msg = meta.get("githubCommitMessage", "")[:60].replace("\n", " ")
        target = d.get("target") or "preview"
        user = d.get("creator", {}).get("username", "?")
        created = format_ts(d.get("created"))

        print(
            f"{d['url']:<60} {target:<12} {d['state']:<10} {sha:<10} {ref:<20} {user:<20} {created:<18} {msg}"
        )

    # Output deployment UIDs for bulk deletion (one per line)
    uids = [d["uid"] for d in old_deps]
    uid_file = "old-deployment-uids.txt"
    with open(uid_file, "w") as f:
        for uid in uids:
            f.write(uid + "\n")
    print(f"\nWrote {len(uids)} deployment UIDs to {uid_file}", file=sys.stderr)
    print(f"To delete 50 at a time:", file=sys.stderr)
    print(f"  vercel remove $(head -50 {uid_file}) --scope {SCOPE}", file=sys.stderr)
    print(f"  sed -i '' '1,50d' {uid_file}", file=sys.stderr)


if __name__ == "__main__":
    main()
