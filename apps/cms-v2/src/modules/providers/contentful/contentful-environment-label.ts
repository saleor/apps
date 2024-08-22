import { Environment } from "contentful-management";

export const getContentfulEnvironmentLabel = (item: Pick<Environment, "sys" | "name">) => {
  if (!item.sys?.aliases?.length) {
    return item.name;
  }

  const aliases = item.sys?.aliases?.map((alias) => alias.sys.id);

  if (aliases.length > 1) {
    return `${item.name} (Aliases: ${aliases.join(", ")})`;
  }

  return `${item.name} (Alias: ${aliases[0]})`;
};
