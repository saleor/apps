## How to test SMTP app

1. Run docker image with mailhog by running `docker-compose up` command in app directory
2. Mailhog server is now running, use this information in SMTP app:

- Host: 0.0.0.0
- Port: 1025
- User: test
- Password: test

3. Provide configuration name
4. Save config
5. Now provide sender email, name and save
6. Select `Order created` from events and save
7. Now you can go to orders tab and create new order
8. Open http://0.0.0.0:8025/# and you should see new email
