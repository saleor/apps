# Private Apps in Saleor Monorepo

This document explains how private Saleor apps are managed within the monorepo using Git submodules.

## Overview

Some Saleor apps are maintained in private repositories with restricted access. These apps are integrated into the monorepo as **Git submodules**, allowing:

- ✅ Authorized users to develop with private apps locally
- ✅ Unauthorized users to work with public apps without issues
- ✅ Private code to remain secure in separate repositories
- ✅ Shared packages and tooling to work across all apps

## Current Private Apps

| App Name | Repository | Required Access |
|----------|-----------|----------------|
| test-app | `@saleor/test-app` | Private repository access |

## Setup for Developers

### Prerequisites

Ensure you have access to the private repository and your Git authentication is configured:

- **SSH**: Your SSH key must be added to your GitHub account
- **HTTPS**: You need a GitHub personal access token with repo access

### Initial Setup

1. **Clone the main repository** (if you haven't already):
   ```bash
   git clone https://github.com/saleor/apps.git
   cd apps
   ```

2. **Initialize private apps you have access to**:
   ```bash
   ./scripts/setup-private-apps.sh
   ```

   This script will:
   - Check which private apps are configured
   - Attempt to initialize each submodule
   - Skip apps you don't have access to (this is normal!)
   - Install dependencies for successfully initialized apps

3. **Install all dependencies**:
   ```bash
   pnpm install
   ```

### Updating Private Apps

To update private apps to their latest versions:

```bash
./scripts/setup-private-apps.sh --force
```

Or manually:

```bash
git submodule update --remote apps/test-app
pnpm install
```

### Daily Development

Once initialized, private apps work just like public apps:

```bash
# Start all apps (including private ones you have access to)
pnpm dev

# Start a specific private app
pnpm --filter test-app dev

# Run tests
pnpm test:ci

# Build everything
pnpm build
```

## Working Without Access to Private Apps

**You don't need access to private apps to contribute!** The monorepo is designed to work seamlessly without them:

- Public apps and shared packages are fully functional
- Build, test, and development commands work normally
- CI/CD pipelines handle missing private apps gracefully
- Turborepo skips private apps that aren't available

If you try to run the setup script without access:

```bash
./scripts/setup-private-apps.sh
```

You'll see a message like:

```
⚠️  Initialization failed (this is expected if you don't have access)
```

This is completely normal and expected.

## Architecture Details

### How It Works

Private apps use **Git submodules**, which are references to separate Git repositories:

- The main repository (`.git`) contains only a reference to the private repo
- The private app code lives in its own repository with separate access control
- Git tracks which commit of the private repo to use
- Users without access see an empty or missing directory

### Directory Structure

```
apps/
├── avatax/           # Public app
├── stripe/           # Public app
├── test-app/         # Private app (submodule)
│   └── .git          # Links to private repository
└── ...
```

### PNPM Workspace Integration

Private apps are included in `pnpm-workspace.yaml`:

```yaml
packages:
  - apps/*      # Includes both public and private apps
  - packages/*
```

PNPM gracefully handles missing apps - if a private app isn't initialized, it's simply skipped.

### Turborepo Integration

Turborepo automatically detects available workspaces:

- Runs tasks only on initialized apps
- Skips missing private apps without errors
- Maintains dependency graph between shared packages and private apps

## Adding a New Private App

To add a new private app to the monorepo:

1. **Create the private repository** (e.g., `@saleor/new-private-app`)

2. **Add it as a submodule**:
   ```bash
   git submodule add https://github.com/saleor/new-private-app.git apps/new-private-app
   ```

3. **Update `.gitignore`**:
   ```gitignore
   # Add to the Private apps section
   apps/new-private-app/.gitignore
   apps/new-private-app/*
   !apps/new-private-app/.gitkeep
   ```

4. **Update documentation**:
   - Add the app to the table in this file
   - Update README.md if needed

5. **Test the setup**:
   ```bash
   # Test that it works for users WITH access
   ./scripts/setup-private-apps.sh
   pnpm install
   pnpm build

   # Test that it works for users WITHOUT access
   # (Deinitialize the submodule temporarily)
   git submodule deinit apps/new-private-app
   pnpm build  # Should still work!
   ```

6. **Commit the changes**:
   ```bash
   git add .gitmodules .gitignore PRIVATE_APPS.md
   git commit -m "Add new-private-app as private submodule"
   ```

## Troubleshooting

### Authentication Issues

**Problem**: `Permission denied` or `Authentication failed`

**Solution**:
- For SSH: `ssh -T git@github.com` to test your SSH key
- For HTTPS: Ensure your GitHub token is in Git credentials
- Check you have access to the private repository on GitHub

### Submodule Not Updating

**Problem**: Private app code is outdated

**Solution**:
```bash
git submodule update --remote apps/test-app
pnpm install
```

### Submodule In Detached HEAD State

**Problem**: Git shows "detached HEAD" when in private app directory

**Solution**: This is normal for submodules. To work on the private app:
```bash
cd apps/test-app
git checkout main  # or your working branch
```

### Build Fails Due to Missing Private App

**Problem**: Build fails with missing dependencies from private app

**Solution**: This shouldn't happen, but if it does:
1. Ensure the private app doesn't expose types or modules to public packages
2. Use conditional imports if integration is needed
3. Report the issue - private apps should be truly optional

## CI/CD Considerations

The monorepo's CI/CD is configured to handle private apps:

- **Public PRs**: CI runs without private apps (they're not initialized)
- **Internal PRs**: CI can optionally initialize private apps with access tokens
- **Build matrix**: Excludes private apps from coverage uploads if not present
- **Turbo cache**: Works independently for public and private apps

## Security Best Practices

- ✅ **DO**: Keep sensitive code, credentials, and business logic in private repos
- ✅ **DO**: Ensure private apps have their own `.gitignore` and don't commit secrets
- ✅ **DO**: Use environment variables for private app configuration
- ❌ **DON'T**: Reference private app code from public packages
- ❌ **DON'T**: Commit private app code to the main repository
- ❌ **DON'T**: Include private app secrets in the main repo's `.env.example`

## FAQ

**Q: Can I develop a private app without cloning the whole monorepo?**

A: Yes! You can work directly in the private repository. Just ensure your `package.json` uses the same shared package versions.

**Q: Will my changes to shared packages affect private apps?**

A: Yes, private apps use shared packages via PNPM workspaces. Test thoroughly!

**Q: What if I accidentally commit private app code to the main repo?**

A: Don't panic! Contact the team immediately. We'll need to:
1. Revert the commit
2. Force push to remove from history
3. Rotate any exposed secrets

**Q: How do I know if I have access to a private app?**

A: Try running `./scripts/setup-private-apps.sh`. If initialization succeeds, you have access!

## Related Documentation

- [Git Submodules Documentation](https://git-scm.com/book/en/v2/Git-Tools-Submodules)
- [PNPM Workspaces](https://pnpm.io/workspaces)
- [Turborepo Docs](https://turbo.build/repo/docs)

## Support

If you encounter issues with private apps:

1. Check this documentation first
2. Run `./scripts/setup-private-apps.sh --force` to reinitialize
3. Ask in the team Slack channel
4. Open an issue in the main repository (don't include private app details!)
