# Troubleshooting

## For all providers

- [ ] Make sure the configuration is activated
  1. Go to configuration details
  1. In the `Status and name` section, `Active` should be checked
- [ ] Configuration is enabled for the channel
  1. Go to configuration details
  1. If channel assignment is overwritten, ensure channel the event originated from is not excluded
- [ ] Ensure the sender details are filled in
  1. Go to configuration details
  1. Fill fields in the `Sender` section
- [ ] Event is activated
  1. Go to configuration details
  1. In the `Events` section, `Active` should be checked for event you are investigating

## SMTP

- [ ] Template preview is rendering
  1. Go to configuration details
  1. In the `Events` section, click on `Edit` for event you are investigating
  1. Template on the right hand side should be rendering properly

## Sendgrid

- [ ] Sandbox mode is not active
  1. Go to configuration details
  1. In the `API connection` section, sandbox mode should not be activated
- [ ] API key is still active
- [ ] Sender is configured and available
- [ ] Dynamic templates are configured and available
