import { LogDrainTransporter } from "../public-log-drain";
import { PublicLog } from "../public-events";

export class LogDrainJsonTransporter implements LogDrainTransporter {
  private endpoint: string | null = null;

  async emit(log: PublicLog): Promise<void> {
    if (!this.endpoint) {
      throw new Error("Endpoint is not set, call setSettings first");
    }

    return fetch(this.endpoint, {
      method: "POST",
      body: JSON.stringify(log),
    })
      .then((r) => r.json())
      .then((res) => {
        console.log(res); // todo

        return;
      });
  }

  setSettings() {}
}
