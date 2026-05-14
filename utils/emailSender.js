const nodemailer = require('nodemailer');

const hasEmailConfig = !!(process.env.EMAIL_USER && process.env.EMAIL_PASS
  && !process.env.EMAIL_USER.includes('your_'));

const transporter = hasEmailConfig
  ? nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    })
  : null;

exports.sendEmail = async (to, subject, text) => {
  if (!transporter) {
    console.warn('[emailSender] Email not configured — skipping send to', to);
    return;
  }
  await transporter.sendMail({ from: process.env.EMAIL_USER, to, subject, text });
};

/** Stub: send account verification link */
exports.sendVerificationEmail = async (email) => {
  if (!transporter) {
    console.warn('[emailSender] Email not configured — skipping verification email to', email);
    return;
  }
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Verify your WAMDIN account',
    text: 'Thank you for registering. Please contact your administrator to verify your account.',
  });
};
