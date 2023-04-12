# Contentful

## Configuration

Contentful integration requires several configuration tokens. You should enter them in the _Apps -> CMS_ configuration view.

Here is the list of the tokens and instructions on how to obtain them:

- `baseUrl`: the API URL. For Contentful, it's `https://api.contentful.com`.
- `token`: the authorization token. For instructions on how to create one for CMS Hub, please go to _API keys in the Contentful web app_ section in the [Contentful "Authentication" documentation](https://www.contentful.com/developers/docs/references/authentication/).
- `environment`: id of the Contentful environment you use. To find it, go to _Settings -> Environments_ in the Contentful dashboard.
- `spaceId`: id of the Contentful space. To find it, go to _Settings -> General settings_ in the Contentful dashboard.
- `contentId`: the id of the content model. To obtain it, go to _Content model_ and to the view of a single product in your Contentful dashboard. Your URL may look something like: "https://app.contentful.com/spaces/xxxx/content_types/product/fields". Then, look to the right side of the screen. You will find a copyable "CONTENT TYPE ID" box there.
- `locale`: the localization code for your content. E.g.: `en-US`.
- `apiRequestsPerSecond`: API rate limits (API requests per second). The default is 7. Used in bulk products variants sync. Higher rate limits may speed up a little products variants bulk sync. Higher rate limit may apply depending on different Contentful plan, learn more at https://www.contentful.com/developers/docs/references/content-management-api/#/introduction/api-rate-limits.
