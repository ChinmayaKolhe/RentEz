import nodemailer from 'nodemailer';

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email service error:', error);
  } else {
    console.log('✅ Email service is ready');
  }
});

// Send email function
export const sendEmail = async (options) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: options.to,
    subject: options.subject,
    html: options.html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw error;
  }
};

// Rent reminder email template
export const sendRentReminder = async (tenant, property, payment) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏠 Rent Payment Reminder</h1>
        </div>
        <div class="content">
          <p>Dear ${tenant.name},</p>
          <p>This is a friendly reminder that your rent payment is due soon.</p>
          
          <div class="details">
            <h3>Payment Details:</h3>
            <p><strong>Property:</strong> ${property.title}</p>
            <p><strong>Address:</strong> ${property.address.street}, ${property.address.city}</p>
            <p><strong>Amount Due:</strong> ₹${payment.amount.toLocaleString()}</p>
            <p><strong>Due Date:</strong> ${new Date(payment.dueDate).toLocaleDateString()}</p>
            <p><strong>Status:</strong> ${payment.status.toUpperCase()}</p>
          </div>
          
          <p>Please ensure timely payment to avoid any late fees.</p>
          
          <p>If you have already made the payment, please disregard this email.</p>
          
          <p>Thank you for being a valued tenant!</p>
          
          <p>Best regards,<br>The RentEz Team</p>
        </div>
        <div class="footer">
          <p>This is an automated message from RentEz Property Management Platform</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: tenant.email,
    subject: `Rent Payment Reminder - ${property.title}`,
    html,
  });
};

// Welcome email template
export const sendWelcomeEmail = async (user) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to RentEz! 🎉</h1>
        </div>
        <div class="content">
          <p>Dear ${user.name},</p>
          <p>Welcome to RentEz - Your trusted property rental and management platform!</p>
          <p>We're excited to have you on board as a ${user.role}.</p>
          <p>Start exploring properties and connecting with ${user.role === 'owner' ? 'tenants' : 'property owners'} today!</p>
          <p>Best regards,<br>The RentEz Team</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: user.email,
    subject: 'Welcome to RentEz!',
    html,
  });
};

export default transporter;
