import debugPkg from "debug";

export const createDebug = (namespace: string) => debugPkg.debug(`app-search:${namespace}`);
