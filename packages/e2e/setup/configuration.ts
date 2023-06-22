import { z } from "zod";

const instanceUrl = process.env.INSTANCE_URL;
const dashboardUserEmail = process.env.DASHBOARD_USER_EMAIL;
const dashboardUserPassword = process.env.DASHBOARD_USER_PASSWORD;

export const configuration = z
  .object({
    instanceUrl: z.string().nonempty().url(),
    dashboardUserEmail: z.string().nonempty(),
    dashboardUserPassword: z.string().nonempty(),
  })
  .parse({
    instanceUrl,
    dashboardUserEmail,
    dashboardUserPassword,
  });
