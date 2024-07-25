## How to configure the SMTP app:

To configure the app you need an SMTP server. You can run it locally using Docker.

1. In the terminal navigate to your app folder and run `docker-compose up`
2. The Mailhog server is now running, here are the server details that you need to configure the app:

- Host: 0.0.0.0
- Port: 1025
- User: test
- Password: test

3. Go to the app and click the `Add configuration` button
4. Now in the `Status and name` section provide the configuration name and save
5. Go to the `Connect SMTP server` section and fill `Host`, `Port`, `User` and `Password` fields with data from point 2, save the config
6. Go to the `Sender` section and provide the sender email and name, save the config
7. Go to `Events` and select which event you want to send email to, for example, `Order created` and save config

## How to test the configuration

1. If you selected `Order created` as an event go to the `Order` tab and create a new order
2. After order creation, the app should send the email
3. Open http://0.0.0.0:8025/# and you should see the new email
