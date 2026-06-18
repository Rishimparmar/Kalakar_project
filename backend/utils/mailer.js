const nodemailer = require('nodemailer');

// Configure transport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Helper to send emails
const sendEmail = async (to, subject, htmlContent) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('Email credentials missing. Skipping email notification to:', to);
    return false;
  }

  try {
    const info = await transporter.sendMail({
      from: `"Kalaakar" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: htmlContent
    });
    console.log('Email sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

// --- Email Templates ---

const templates = {
  customerOrderConfirmation: (name, orderNumber, price, type) => `
    <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #bc7c76;">Thank you for your order!</h2>
      <p>Hi ${name},</p>
      <p>We have successfully received your custom order request for <strong>${type}</strong>.</p>
      <div style="background: #fdfaf6; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>Order ID:</strong> ${orderNumber}</p>
        <p style="margin: 5px 0;"><strong>Estimated Price:</strong> ₹${price}</p>
        <p style="margin: 5px 0;"><strong>Status:</strong> Pending Review</p>
      </div>
      <p>Mahek will review your request shortly. If we need any further details, we will reach out to you via WhatsApp or Email.</p>
      <p>Best regards,<br/><strong>Kalaakar Team</strong></p>
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
