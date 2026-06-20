export async function sendValidationEmail(email: string, name: string, token: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const senderEmail = process.env.SENDER_EMAIL || 'onboarding@resend.dev';

  if (!apiKey) {
    console.warn('RESEND_API_KEY not configured. Skipping validation email.');
    return null;
  }

  const rootDomain = process.env.ROOT_DOMAIN || 'localhost:3000';
  // Use http for localhost, https for production domains
  const protocol = rootDomain.startsWith('localhost') ? 'http' : 'https';
  const verificationLink = `${protocol}://${rootDomain}/api/auth/verify?token=${token}`;

  const url = 'https://api.resend.com/emails';
  const body = {
    from: senderEmail,
    to: email,
    subject: 'Verify Your BeelInk Account 🐝',
    html: `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 4px solid #000000; padding: 32px; background-color: #ffffff; color: #000000; box-shadow: 8px 8px 0px 0px #000000;">
        <div style="background-color: #facc15; border-bottom: 4px solid #000000; margin: -32px -32px 32px -32px; padding: 24px 32px;">
          <h1 style="font-size: 36px; font-weight: 900; text-transform: uppercase; margin: 0; letter-spacing: -0.05em; line-height: 1;">
            BEELINK <span>🐝</span>
          </h1>
          <p style="font-size: 12px; font-weight: 900; text-transform: uppercase; margin: 4px 0 0 0; tracking: 0.1em; color: #000000;">
            Instant Digital Invoices
          </p>
        </div>

        <h2 style="font-size: 24px; font-weight: 900; text-transform: uppercase; margin-top: 0; margin-bottom: 16px; border-bottom: 3px solid #000000; padding-bottom: 8px;">
          Verify Your Email
        </h2>

        <p style="font-size: 16px; font-weight: 700; line-height: 1.5; margin-bottom: 24px;">
          Hello ${name}, thank you for registering! Please verify your email address to activate your BeelInk merchant account. This link will expire in 24 hours.
        </p>

        <a href="${verificationLink}" style="display: inline-block; background-color: #22d3ee; color: #000000; font-weight: 900; text-transform: uppercase; text-decoration: none; padding: 16px 32px; border: 3px solid #000000; box-shadow: 4px 4px 0px 0px #000000; margin-bottom: 32px; font-size: 16px;">
          Verify Email Address →
        </a>

        <div style="margin-top: 10px; margin-bottom: 32px; padding: 16px; background-color: #f3f4f6; border: 2px solid #000000;">
          <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: bold; text-transform: uppercase; color: #4b5563;">
            If the button doesn't work, copy and paste this link in your browser:
          </p>
          <p style="margin: 0; font-size: 12px; font-family: monospace; word-break: break-all; font-weight: bold;">
            ${verificationLink}
          </p>
        </div>

        <div style="border-top: 3px solid #000000; padding-top: 20px; font-size: 12px; font-weight: 700; text-transform: uppercase; color: #4b5563;">
          Happy selling,<br/>
          <span style="color: #000000; font-weight: 900;">The BeelInk Team</span>
        </div>
      </div>
    `
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    if (!res.ok) {
      console.error('Resend API Error:', data);
    } else {
      console.log('Validation email sent successfully:', data);
    }
    return data;
  } catch (error) {
    console.error('Failed to send validation email:', error);
    return null;
  }
}
