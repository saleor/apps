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
          value: r.id,
          label: r.name,
        })) || [];
      return templates;
    } catch (e) {
      console.error("Could not parse the response from Sendgrid", e);
      return [];
    }
  };
