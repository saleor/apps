/**
 * MJML banner injected into fallback emails when the recipient is redirected
 * to the organization owner's address.
 */
export const REDIRECT_BANNER = `<mj-section background-color="#fef3c7" padding="12px 16px">
  <mj-column>
    <mj-text font-size="13px" line-height="1.5" color="#92400e" font-weight="600">
      Preview only: This email was sent through Saleor's preview mail path and is delivered to organization owner's email address. To send emails to customers, provide configuration in Saleor SMTP app.
    </mj-text>
  </mj-column>
</mj-section>`;
