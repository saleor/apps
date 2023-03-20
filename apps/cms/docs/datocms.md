# DatoCMS

## Configuration

DatoCMS integration requires several configuration tokens. You should enter them in the _Apps -> CMS_ configuration view.

Here is the list of the tokens and instructions on how to obtain them

- `baseUrl`: the optional URL to your DatoCMS project. If you leave this blank, this URL will be inferred from your API Token.
- `token`: the API token with access to Content Management API. You can find this in your DatoCMS project settings. More instructions of how to create it available at [DatoCMS "Authentication" documentation](https://www.datocms.com/docs/content-management-api/authentication).
- `itemTypeId`: item type ID (number). You can find this as Model ID in your DatoCMS product variant model settings, by clicking "Edit model".
- `environment`: optional environment name. If you leave this blank, default environment will be used. You can find this in your DatoCMS project settings.
