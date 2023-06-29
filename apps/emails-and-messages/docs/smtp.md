# SMTP provider

To use this provider, you will need SMTP server credentials. Email templates are created using [MJML](https://mjml.io/) language and can be edited in dashboard. Dynamic parts of the email (for example number of the order) can be added using [Handlebars](https://handlebarsjs.com/).

## Before you start - server credentials

Using provider requires access to SMTP server. Depending on your needs, choose one of our recommendations.

### For production environments

- [Amazon SES](https://aws.amazon.com/ses/)
- [Mailgun](https://www.mailgun.com/)
- [Mailtrap](https://mailtrap.io/)

### For testing

There are dedicated services for testing email delivery. One of them is [Mailtrap](https://mailtrap.io/).

> **Note**
> Such services capture emails and display it in their interface for inspection. Original addressee should not receive any message.

To get credentials needed to configuring the app, follow [the guide](https://help.mailtrap.io/article/109-getting-started-with-mailtrap-email-testing).

### For local development

If you are developer working on EAM and don't want to use external service, you can use Mailhog which comes pre configured in this repository.

Requirements:

- Docker is installed
- `docker compose` command is available

To start the service:

1. Open EAM app folder in terminal
1. Use command `docker compose up`

Mailhog will start SMTP server and web interface. Now you can update provider configuration:

- Host: `localhost`
- Port: `1025`
- The rest can be left empty

All emails will be captured by the MailHog service. To inspect emails, open `http://localhost:8025/` in your browser.

# Creating configuration

1. In the Saleor Dashboard navigate to the apps section
1. Install Emails and Messages app
1. After installation, click app name
1. Click on `Add provider`
1. Choose `SMTP`
1. Provide SMTP server credentials created in previous step
1. Click on `Save provider`
1. Application will redirect automatically to the configuration details
1. Enter sender details, which will be displayed as author of the emails for your customers
1. Click on `Save provider`
1. In the events section choose which of the emails should be sent. You can also modify template of the emails.
1. Click on `Save provider`

Now application is configured and emails will be sent.
