import { AppContext } from "@/lib/app-context";

export class ResponseMessageFormatter {
  private appContext: AppContext;

  constructor(appContext: AppContext) {
    this.appContext = appContext;
  }

  private verboseErrorEnabled = () => this.appContext.stripeEnv === "TEST";

  formatMessage = (message: string, error?: Error) => {
    if (this.verboseErrorEnabled() && error?.message) {
      // todo probably should restore entire chain
      return `${message}: ${error?.message}`;
    }

    return message;
  };
}
