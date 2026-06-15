const nodemailer = require('nodemailer');

let transporter = null;

const getTransporter = async () => {
  if (transporter) return transporter;

  // Try using Gmail first
  try {
    const gmailTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Verify Gmail transport
    await new Promise((resolve, reject) => {
      gmailTransporter.verify((err, success) => {
        if (err) reject(err);
        else resolve(success);
      });
    });

    console.log("SMTP configured successfully with Gmail.");
    transporter = gmailTransporter;
    return transporter;
  } catch (err) {
    console.log("Gmail SMTP authentication failed, generating Ethereal test inbox...");
    
    // Fallback: create ethereal test account
    try {
      const testAccount = await nodemailer.createTestAccount();
      const etherealTransporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false, 
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      
      console.log("=== ETHEREAL SMTP READY ===");
      console.log("User:", testAccount.user);
      console.log("============================");
      
      transporter = etherealTransporter;
      return transporter;
    } catch (etherealErr) {
      console.error("Failed to create Ethereal account, using mock mailer:", etherealErr.message);
      
      // Ultimate fallback: mock transporter that doesn't fail
      transporter = {
        sendMail: async (options) => {
          console.log("Mock Mailer logged delivery to:", options.to, options.subject);
          return { messageId: 'mock-id' };
        }
      };
      return transporter;
    }
  }
};

const sendVerificationEmail = async (email, fullName, token) => {
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
  const verifyURL = `${backendUrl}/api/auth/verify-email?token=${token}`;
  const mailTransporter = await getTransporter();

  const info = await mailTransporter.sendMail({
    from: `"MealCraft" <${process.env.EMAIL_USER || 'no-reply@mealcraft.com'}>`,
    to: email,
    subject: '✅ Verify your MealCraft account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;">
        <h2 style="color: #e67e22;">Welcome to MealCraft, ${fullName}! 🍽️</h2>
        <p>Please verify your email by clicking the button below:</p>
        <a href="${verifyURL}" 
           style="background:#e67e22; color:white; padding:12px 24px; 
                  border-radius:8px; text-decoration:none; display:inline-block;">
          Verify Email
        </a>
        <p style="color:#999; margin-top:20px;">Link expires in 24 hours.</p>
      </div>
    `,
  });

  const preview = nodemailer.getTestMessageUrl(info);
  if (preview) {
    console.log("Verification Email Inbox: %s", preview);
    info.previewUrl = preview;
  }
  return info;
};

const sendPasswordResetEmail = async (email, fullName, resetURL) => {
  const mailTransporter = await getTransporter();
  
  const info = await mailTransporter.sendMail({
    from: `"MealCraft" <${process.env.EMAIL_USER || 'no-reply@mealcraft.com'}>`,
    to: email,
    subject: '🔒 Reset your MealCraft password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;">
        <h2 style="color: #e67e22;">Password Reset Request</h2>
        <p>Hi ${fullName},</p>
        <p>We received a request to reset your MealCraft password. Click the button below to choose a new password:</p>
        <a href="${resetURL}" 
           style="background:#e67e22; color:white; padding:12px 24px; 
                  border-radius:8px; text-decoration:none; display:inline-block;">
          Reset Password
        </a>
        <p style="color:#999; margin-top:20px;">If you didn't request a password reset, please ignore this email. This link will expire in 1 hour.</p>
      </div>
    `,
  });

  const preview = nodemailer.getTestMessageUrl(info);
  if (preview) {
    console.log("Password Reset Email Inbox: %s", preview);
    info.previewUrl = preview;
  }
  return info;
};

const sendOTPEmail = async (email, fullName, otp) => {
  const mailTransporter = await getTransporter();

  await mailTransporter.sendMail({
    from: `"MealCraft" <${process.env.EMAIL_USER || 'no-reply@mealcraft.com'}>`,
    to: email,
    subject: '🔑 Your MealCraft Verification OTP Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
        <h2 style="color: #e67e22; text-align: center;">MealCraft Account Verification</h2>
        <p>Hi ${fullName},</p>
        <p>Thank you for signing up with MealCraft! Please verify your email address using the following 6-digit OTP code:</p>
        <div style="background: #f8f9fa; border: 1px dashed #e67e22; padding: 15px; text-align: center; font-size: 30px; font-weight: bold; letter-spacing: 5px; color: #333; margin: 20px 0; border-radius: 8px;">
          ${otp}
        </div>
        <p style="color: #999; text-align: center; font-size: 12px;">This code is valid for 10 minutes. Please do not share this code with anyone.</p>
      </div>
    `,
  });
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail, sendOTPEmail };