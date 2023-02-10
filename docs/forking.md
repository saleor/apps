# Forking

Saleor apps come out of the box in Saleor Cloud plans, but all apps are open source and can be used
under the [BSD-3 license](../LICENSE).

When forking, you are most likely interested in an individual app. This monorepo, however, contains all of the Saleor apps.

Luckily, you can still fork and be able to track and merge the original source code with two strategies:

## 1. Delete unused apps

The repository contains apps and packages which are imported by apps. Apps never import other apps,
so you can safely delete them.

When you remove all the apps except the one you need, Turborepo will continue to work the same way.

Additionally, you can run scripts per individual apps with `turbo run SCRIPT --filter=saleor-app-NAME`.

We recommend not removing anything else to avoid unnecessary conflicts.

If you want to update the repository, you can still merge or rebase it with the original source code. 
You may face conflicts for apps you don't have anymore, but you can safely delete them again during conflict resolution.

## 2. Keep everything

To avoid conflicts to a minimum, you can leave other apps and just ignore them. These tips can help you with a single app experience:
- Mark other app folders as "excluded" in your IDE to avoid indexing these files.
- Run your scripts with Turborepo filters, e.g. `turbo run SCRIPT --filter=saleor-app-NAME`.
- Use `pnpm` to avoid duplicated packages. `pnpm` installs packages once and links them, which causes minimal performance overhead of node_modules.

