import { AuthData } from "@saleor/app-sdk/APL";

export class AppUrlGenerator {
  constructor(private authData: Pick<AuthData, "appId" | "saleorApiUrl">) {}

  private getAppBaseUrlRelative(appId: string) {
    return `/dashboard/apps/${encodeURIComponent(appId)}/app/app`;
  }

  private getAppBaseUrlAbsolute(appId: string, saleorApiUrl: string) {
    const saleorDashboardUrl = saleorApiUrl.replace("/graphql/", "");
    return `${saleorDashboardUrl}${this.getAppBaseUrlRelative(appId)}`;
  }

  getTransactionDetailsUrl(transactionId: string) {
    const baseUrl = this.getAppBaseUrlAbsolute(this.authData.appId, this.authData.saleorApiUrl);
    return `${baseUrl}/transactions/${transactionId}`;
  }
}
