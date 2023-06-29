# Sendgrid

## Creating configuration

Before you start, configure your Sendgrid Account:

- Generate **API key**

  - [Sendgrid documentation about setting up API keys](https://docs.sendgrid.com/for-developers/sending-email/brite-verify#creating-a-new-api-key)

- Create **Sender**

  - [Sendgrid documentation about senders](https://docs.sendgrid.com/ui/sending-email/senders)

- For every event message you want to sent to the customers, create **Dynamic template**
  - [Sendgrid documentation for dynamic templates](https://docs.sendgrid.com/ui/sending-email/how-to-send-an-email-with-dynamic-templates#design-a-dynamic-template)

Now you can configure EAM:

1. In the Saleor Dashboard navigate to the apps section
1. Install Emails and Messages app
1. After installation, click app name
1. Click on `Add provider`
1. Choose `Sendgrid`
1. Provide configuration name and API key
1. Click on `Save provider`
1. Application will redirect automatically to the configuration details
1. Choose sender
1. Click on `Save provider`
1. In the events section assign dynamic templates to events
1. Click on `Save provider`

Application is now configured.
