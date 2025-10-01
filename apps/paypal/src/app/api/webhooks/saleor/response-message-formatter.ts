import { AppContext } from "@/lib/app-context";

export class ResponseMessageFormatter {
  private appContext: AppContext;

  constructor(appContext: AppContext) {
    this.appContext = appContext;
  }

  private verboseErrorEnabled = () => this.appContext.paypalEnv === "SANDBOX";

  formatMessage = (message: string, error?: Error) => {
    if (this.verboseErrorEnabled() && error?.message) {
      return `${message}: ${error?.message}`;
    }

    return message;
  };
}
