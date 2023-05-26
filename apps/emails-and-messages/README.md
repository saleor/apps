# Saleor App Emails and messages

![Hero image](https://user-images.githubusercontent.com/249912/71523206-4e45f800-28c8-11ea-84ba-345a9bfc998a.png)

### What's included?

- sending emails via SMTP
- MJML template support
- supported messages:
  - order
    - created
    - confirmed
    - cancelled
    - fully fulfilled
    - fully paid
  - invoice
    - sent

### How to install

- start local dev server or deploy the application
- install the application in your Saleor Instance using manifest URL
- configure the application in the dashboard

## Development

Follow the `Development` guide in the [Saleor App Template](https://github.com/saleor/saleor-app-template#development)

Start the dev SMTP server

```bash
docker compose up
```

All emails will be captured by the MailHog service. To inspect emails, open `http://localhost:8025/` in your browser.
