// Helper to clean environment variables (removing quotes and trimming spaces)
function cleanEnvVar(val) {
  if (!val) return '';
  return val.replace(/^"|"$/g, '').trim();
}

// Helper to refresh access token using refresh_token
async function getAccessToken() {
  const clientId = cleanEnvVar(process.env.GMAIL_CLIENT_ID);
  const clientSecret = cleanEnvVar(process.env.GMAIL_CLIENT_SECRET);
  const refreshToken = cleanEnvVar(process.env.GMAIL_REFRESH_TOKEN);

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error('Failed to refresh Gmail access token: ' + errText);
  }

  const data = await response.json();
  return data.access_token;
}

// Helper to send emails using Gmail REST API (over HTTPS port 443)
const sendEmail = async (to, subject, htmlContent) => {
  const clientId = cleanEnvVar(process.env.GMAIL_CLIENT_ID);
  const clientSecret = cleanEnvVar(process.env.GMAIL_CLIENT_SECRET);
  const refreshToken = cleanEnvVar(process.env.GMAIL_REFRESH_TOKEN);
  const emailUser = cleanEnvVar(process.env.EMAIL_USER);

  if (!clientId || !clientSecret || !refreshToken || !emailUser) {
    console.warn('Gmail API credentials missing. Skipping email notification to:', to);
    return { success: false, error: 'Gmail REST API credentials (GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN, or EMAIL_USER) are missing in environment variables.' };
  }

  try {
    const accessToken = await getAccessToken();

    const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
    const messageParts = [
      `From: "Kalaakar" <${emailUser}>`,
      `To: ${to}`,
      'Content-Type: text/html; charset=utf-8',
      'MIME-Version: 1.0',
      `Subject: ${utf8Subject}`,
      '',
      htmlContent
    ];
    const message = messageParts.join('\r\n');

    // Gmail API requires base64url encoding
    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        raw: encodedMessage
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error('Gmail API response error: ' + errText);
    }

    const result = await response.json();
    console.log('Email sent via Gmail API: %s', result.id);
    return { success: true, messageId: result.id };
  } catch (error) {
    console.error('Error sending email via Gmail API:', error);
    return { success: false, error: error.message };
  }
};

// --- Email Templates ---

const templates = {
  customerOrderConfirmation: (order) => `
    <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #bc7c76; margin-bottom: 5px;">Thank you for your order!</h1>
        <p style="font-size: 16px; color: #555;">Turning your cherished memories into timeless art.</p>
      </div>

      <p>Hi <strong>${order.name}</strong>,</p>
      <p>We are thrilled to receive your custom order request. Mahek will review your details shortly to ensure everything is perfect. Below is the full summary of your request.</p>
      
      <div style="background: #fdfaf6; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #f0e6d2;">
        <h3 style="margin-top: 0; color: #bc7c76; border-bottom: 1px solid #f0e6d2; padding-bottom: 10px;">Order Summary</h3>
        <p style="margin: 8px 0;"><strong>Order ID:</strong> ${order.orderNumber}</p>
        <p style="margin: 8px 0;"><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        <p style="margin: 8px 0;"><strong>Status:</strong> <span style="background: #ffeeba; padding: 3px 8px; border-radius: 12px; font-size: 12px; font-weight: bold;">PENDING</span></p>

        <h4 style="margin: 15px 0 5px 0; color: #555;">Customer Details</h4>
        <p style="margin: 4px 0;"><strong>Phone:</strong> ${order.phone}</p>
        <p style="margin: 4px 0;"><strong>Email:</strong> ${order.email}</p>
        <p style="margin: 4px 0;"><strong>Delivery Address:</strong> ${order.address || 'Not provided'}</p>

        <h4 style="margin: 15px 0 5px 0; color: #555;">Artwork Details</h4>
        <p style="margin: 4px 0;"><strong>Artwork Type:</strong> ${order.type}</p>
        <p style="margin: 4px 0;"><strong>Size:</strong> ${order.size}</p>
        ${order.color ? `<p style="margin: 4px 0;"><strong>Color Preference:</strong> ${order.color}</p>` : ''}
        ${order.instructions ? `<p style="margin: 4px 0;"><strong>Special Instructions:</strong> ${order.instructions}</p>` : ''}

        <h4 style="margin: 15px 0 5px 0; color: #555;">Pricing Estimate</h4>
        <p style="margin: 4px 0;"><strong>Base Amount + Extras:</strong> ₹${order.price}</p>
        <p style="margin: 4px 0;"><strong>Delivery Zone:</strong> ${order.deliveryZone}</p>
        <p style="margin: 4px 0; font-size: 18px; font-weight: bold; color: #bc7c76; margin-top: 10px; border-top: 1px solid #f0e6d2; padding-top: 10px;">Total Estimated Price: ₹${order.price}</p>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <h3 style="color: #333;">Track Your Order Live</h3>
        <p>You can track the live progress of your artwork from sketch to delivery.</p>
        <p style="background: #eee; display: inline-block; padding: 10px 20px; border-radius: 5px; font-family: monospace; font-size: 16px;">
          Order ID: <strong>${order.orderNumber}</strong><br/>
          Phone: <strong>${order.phone}</strong>
        </p>
        <br/>
        <a href="https://kalaakar.online/track" style="display: inline-block; margin-top: 15px; padding: 12px 25px; background-color: #bc7c76; color: white; text-decoration: none; font-weight: bold; border-radius: 25px;">Track Order Now</a>
      </div>

      <p style="color: #777; font-size: 14px;">If we need any further details, we will reach out to you via WhatsApp or Email.</p>
      <p>Warm regards,<br/><strong>Mahek & The Kalaakar Team</strong></p>
    </div>
  `,

  adminNewOrderAlert: (name, orderNumber, type, email, phone) => `
    <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #bc7c76;">New Custom Order Received!</h2>
      <p><strong>Customer:</strong> ${name}</p>
      <p><strong>Order ID:</strong> ${orderNumber}</p>
      <p><strong>Artwork Type:</strong> ${type}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p>Please check the Admin Dashboard to review the full details and images.</p>
    </div>
  `,

  customerStatusUpdate: (name, orderNumber, newStatus) => `
    <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #bc7c76;">Order Status Update</h2>
      <p>Hi ${name},</p>
      <p>Your custom order (<strong>${orderNumber}</strong>) status has been updated to:</p>
      <h3 style="background: #fdfaf6; padding: 15px; border-radius: 8px; display: inline-block;">${newStatus.toUpperCase()}</h3>
      <p>If you have any questions, feel free to reply to this email or contact us on WhatsApp.</p>
      <p>Best regards,<br/><strong>Kalaakar Team</strong></p>
    </div>
  `
};

module.exports = {
  sendEmail,
  templates
};
