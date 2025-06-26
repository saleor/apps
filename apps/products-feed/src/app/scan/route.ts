/**
 * Execute by CRON, to periodically spawn work on data feed
 */
export const POST = () => {
  /*
   * 1. Verify if source is cron
   * 2. get all APLs
   * 3. Get config from working apps -> check if token is valid
   * 4. Spawn lambda-per-env, fire and forget
   */

  return new Response("Accepted", {
    status: 202,
  });
};
