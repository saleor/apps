import appUrls from "./urls/app-urls";
import saleorUrls from "./urls/saleor-urls";

export const appName = process.env.APP_NAME;  // TODO: name should be taken from the manifest to eliminate possible footguns
export const appUrl = process.env.APP_URL;
export const instanceUrl = process.env.INSTANCE_URL;
export const dashboardUserEmail = process.env.DASHBOARD_USER_EMAIL;
export const dashboardUserPassword = process.env.DASHBOARD_USER_PASSWORD;

export const urls = {
    app: {
        baseUrl: appUrl,
        ...appUrls(appUrl)
    },
    saleor: saleorUrls(instanceUrl)
}
