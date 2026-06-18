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
