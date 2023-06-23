import { AppDetailsFragment } from "../saleor-api/generated/graphql";

interface FilterAppsArgs {
  apps: AppDetailsFragment[];
  filter: {
    id?: string;
    name?: string;
    manifestUrl?: string;
  };
}

export const filterApps = ({ apps, filter: { id, manifestUrl, name } }: FilterAppsArgs) => {
  return apps.filter((app) => {
    if (id && app.id !== id) {
      return false;
    }

    if (name && app.name !== name) {
      return false;
    }

    if (manifestUrl && app.manifestUrl !== manifestUrl) {
      return false;
    }

    return true;
  });
};
