# 3. Use Socket.dev for dependency security

Date: 2026-06-29

## Status

Accepted

## Context

We previously ran `pnpm audit` as a job in our CI (`main.yml`) on every pull request to detect known vulnerabilities in our dependencies. While useful, `pnpm audit` has notable limitations:

- It only reports against the public advisory database (known CVEs), so it misses supply chain threats such as malicious packages, install scripts, typosquatting, or compromised maintainers.
- It produces noisy results that frequently fail CI on advisories we cannot act on (e.g. transitive dependencies with no available fix), forcing manual triage or overrides.
- It provides no signal on the introduction of new risky dependencies in a pull request.

We have adopted [Socket.dev](https://socket.dev), which continuously monitors our dependencies and analyzes the actual behavior of packages (network access, filesystem access, install scripts, shell access, etc.) rather than relying solely on a CVE database. Socket integrates directly with GitHub and surfaces findings on pull requests.

## Decision

We will use Socket.dev as our dependency security tooling and remove the `pnpm audit` job from CI.

Dependency security checks are now handled by the Socket.dev GitHub integration, which reviews pull requests for supply chain risks and known vulnerabilities.

## Consequences

- The `audit` job has been removed from `.github/workflows/main.yml`. Pull requests no longer fail on `pnpm audit` results.
- Dependency security signal comes from Socket.dev's GitHub integration instead of CI.
- Developers should review Socket.dev findings on pull requests as part of the review process.
- Configuration and policy for Socket.dev is managed through the Socket.dev dashboard/GitHub app rather than in the repository's CI configuration.
