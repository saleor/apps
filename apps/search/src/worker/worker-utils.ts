import { makeWorkerUtils, WorkerUtils } from "graphile-worker";

/**
 * Ensure Singleton
 */
let _workerUtils: WorkerUtils | null = null;

export const getWorkerUtils = async () => {
  if (_workerUtils) {
    return _workerUtils;
  }

  _workerUtils = await makeWorkerUtils({
    connectionString: process.env.DATABASE_URL,
  });

  return _workerUtils;
};
