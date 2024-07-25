## How to configure the app:

To configure app you need SMTP server, you can run it locally using docker

1. In terminal navigate to your app folder and run `docker-compose up`
2. Mailhog server is now running, here are server details that you need to configure app:

- Host: 0.0.0.0
- Port: 1025
- User: test
- Password: test

3. Go to the app and click `Add configuration` button
4. Now in `Status and name` section provide configuration name and save
5. Go to `Connect SMTP server` section and fill `Host`, `Port`, `User` and `Password` fields with data from point 2, save config
6. Go to `Sender` section and provide sender email and name, save config
7. Go to `Events` and select on which event you want to send email, for example `Order created`, save config

## How to test the configuration

1. If you selected `Order created` as event go to `Order` tab and create new order
2. After order creation, app should send email
3. Open http://0.0.0.0:8025/# and you should see new email
