interface FetchTemplatesArgs {
  apiKey?: string;
}

export const fetchTemplates =
  ({ apiKey }: FetchTemplatesArgs) =>
  async () => {
    if (!apiKey) {
      console.warn(
        "The Sendgrid API key has not been set up yet. Skipping fetching available templates."
      );
      return [];
    }
    const response = await fetch(
      "https://api.sendgrid.com/v3/templates?generations=dynamic&page_size=18",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    if (!response.ok) {
      console.error("Could not fetch available Sendgrid templates");
      return [];
    }
    try {
      const resJson = (await response.json()) as {
        result?: { id: string; name: string }[];
      };
      const templates =
        resJson.result?.map((r) => ({
          value: r.id.toString(),
          label: r.name,
        })) || [];

      return templates;
    } catch (e) {
      console.error("Could not parse the response from Sendgrid", e);
      return [];
    }
  };

export const fetchSenders =
  ({ apiKey }: FetchTemplatesArgs) =>
  async () => {
    if (!apiKey) {
      console.warn(
        "The Sendgrid API key has not been set up yet. Skipping fetching available senders  ."
      );
      return [];
    }
    const response = await fetch("https://api.sendgrid.com/v3/verified_senders?page_size=18", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      console.error("Could not fetch available Sendgrid senders");
      return [];
    }
    try {
      const resJson = (await response.json()) as {
        results?: { id: string; nickname: string; from_email: string }[];
      };
      const senders =
        resJson.results?.map((r) => ({
          value: r.id.toString(),
          label: `${r.nickname} (${r.from_email})`,
          nickname: r.nickname,
          from_email: r.from_email,
        })) || [];

      return senders;
    } catch (e) {
      console.error("Could not parse the response from Sendgrid", e);
      return [];
    }
  };
