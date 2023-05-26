# Saleor App Slack

![Hero image](https://user-images.githubusercontent.com/249912/71523206-4e45f800-28c8-11ea-84ba-345a9bfc998a.png)

Send Slack messages based on `order_created` events.

### What's included?

- Connection between Saleor and Slack using webhook
- Example `order_created` webhook that triggers Slack bot to send message

## How to use this project

### Select your APL

If you want to develop single tenant application - use already configured `FileAPL` for local development.

If you need to support multiple tenants application or you want to deploy your application - use `UpstashAPL`. Follow [How to configure Upstash](docs/upstash.md) for more info.

To read more about storing auth data, read the [APL documentation](https://github.com/saleor/saleor-app-sdk/blob/main/docs/apl.md)

### Connecting your application to Slack

Read how to connect the app with the Slack [here](./docs/setup-slack-app.md)

## Development

Follow the `Development` guide in the [Saleor App Template](https://github.com/saleor/saleor-app-template#development)