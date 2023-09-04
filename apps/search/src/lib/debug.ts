import debugPkg from "debug";

/**
 * todo rewrite to pino logger
 * @deprecated
 */
export const createDebug = (namespace: string) => debugPkg.debug(`app-search:${namespace}`);
