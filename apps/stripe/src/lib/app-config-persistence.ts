import { FileAppConfigRepo } from "@/modules/app-config/file-app-config-repo";
/*
 * TODO: Temp, replace with DB
 * todo docs that this can be replaced using fork
 */
export const appConfigPersistence = new FileAppConfigRepo();
