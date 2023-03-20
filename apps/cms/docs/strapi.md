# Strapi

## Configuration

Strapi integration requires several configuration tokens. You should enter them in the _Apps -> CMS_ configuration view.

Here is the list of the tokens and instructions on how to obtain them

- `baseUrl`: the API URL. It's the address of your Strapi API. For local Strapi development it will be: `http://localhost:XXXX`.
- `token`: the authorization token. For instructions on how to create one for CMS Hub, please go to the [Strapi "Managing API tokens" documentation](https://docs.strapi.io/user-docs/latest/settings/managing-global-settings.html#managing-api-tokens).
- `contentTypeId`: the content type id. You can find this in your Strapi project, go to Content-Type Builder > select content type > click Edit > use API ID (Plural). For more unstruction of how to get content type id, please go to [Strapi "Editing content types" documentation](https://docs.strapi.io/user-docs/content-type-builder/managing-content-types#editing-content-types).
