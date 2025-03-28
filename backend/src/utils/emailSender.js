const nodemailer = require('nodemailer');

// Create reusable transporter object
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendEmail = async (to, subject, html) => {
  // Validate inputs
  if (!to || !subject || !html) {
    throw new Error('Missing required email parameters');
  }

  try {
    const mailOptions = {
      from: `"Event Management System" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      html: html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (err) {
    console.error('Email send error:', err);
    throw new Error(`Email sending failed: ${err.message}`);
  }
};

module.exports = { sendEmail };