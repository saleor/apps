# Saleor App Emails and messages

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
