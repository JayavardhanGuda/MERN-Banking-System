const nodemailer = require('nodemailer');
const Otp = require('../models/Otp');
const User = require('../models/User');

/**
 * Email transporter using Nodemailer with Gmail SMTP
 * Consider moving to environment variables in production
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: "vjncobank@gmail.com",
      pass: "ojcpjctctzmcmbkv",
    },
    tls: {
      rejectUnauthorized: false,
      minVersion: "TLSv1.2"
    }
  });
};

/**
 * Send OTP email for password reset
 * Helper function
 */
const sendOtpEmail = async (email, otp, firstName) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: '"VJN Cooperative Bank" <vjnbanking@gmail.com>',
      to: email,
      subject: 'VJN Bank - Password Reset OTP',
      html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset OTP</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 40px 0;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                <tr>
                  <td style="background: linear-gradient(135deg, #0d1b3e 0%, #1e3a7a 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
                    <h1 style="color: #c9a84c; margin: 0; font-size: 28px;">VJN Cooperative Bank</h1>
                    <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 14px;">Secure Banking, Trusted Service</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 40px 30px;">
                    <h2 style="color: #0d1b3e; margin: 0 0 20px 0; font-size: 24px;">Password Reset Request</h2>
                    <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                      Dear <strong>${firstName || 'Valued Customer'}</strong>,
                    </p>
                    <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                      We received a request to reset your password. Please use the following One-Time Password (OTP) to proceed:
                    </p>
                    <div style="background: linear-gradient(135deg, #0d1b3e 0%, #1e3a7a 100%); border-radius: 12px; padding: 30px; text-align: center; margin: 0 0 30px 0;">
                      <p style="color: #c9a84c; font-size: 14px; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 2px;">Your OTP Code</p>
                      <h1 style="color: #ffffff; font-size: 42px; letter-spacing: 8px; margin: 0; font-family: 'Courier New', monospace;">${otp}</h1>
                    </div>
                    <div style="background: #fff8e1; border-left: 4px solid #c9a84c; padding: 15px 20px; margin: 0 0 30px 0; border-radius: 0 8px 8px 0;">
                      <p style="color: #856404; font-size: 14px; margin: 0;">
                        <strong>This OTP is valid for 5 minutes only.</strong><br>
                        Do not share this OTP with anyone, including bank employees.
                      </p>
                    </div>
                    <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 0;">
                      If you did not request this password reset, please ignore this email or contact our support team immediately.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="background: #f8f9fa; padding: 25px 30px; text-align: center; border-radius: 0 0 12px 12px; border-top: 1px solid #eee;">
                    <p style="color: #666; font-size: 12px; margin: 0 0 10px 0;">
                      This is an automated message from VJN Cooperative Bank. Please do not reply to this email.
                    </p>
                    <p style="color: #999; font-size: 11px; margin: 0;">
                      VJN Cooperative Bank. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL] ✅ OTP sent to ${email}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[EMAIL] ❌ Error sending email:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Mock SMS sending (implement with real SMS provider like Twilio)
 */
const sendOtpSms = async (phone, otp, firstName) => {
  console.log(`\n📱 [SMS] Sending OTP to ${phone}`);
  console.log(`Message: VJN Bank - Dear ${firstName}, your OTP for password reset is ${otp}. Valid for 5 minutes.`);
  return { success: true, message: 'SMS sent (mock)' };
};

/**
 * Verify email exists
 * POST /api/otp/verify-email
 */
exports.verifyEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }

    const user = await User.findOne({ 
      email: { $regex: new RegExp(`^${email.trim()}$`, 'i') } 
    });

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'No account found with this email address. Please check and try again.' 
      });
    }

    if (user.status !== 'Approved') {
      return res.status(400).json({ 
        success: false, 
        message: 'Your account is not yet approved. Please wait for admin approval or contact support.' 
      });
    }

    const maskedPhone = user.phone 
      ? user.phone.slice(0, 2) + '*'.repeat(user.phone.length - 4) + user.phone.slice(-2)
      : null;
    const maskedEmail = email.split('@')[0].slice(0, 2) + '***@' + email.split('@')[1];

    res.json({
      success: true,
      message: 'User verified successfully',
      data: {
        accountNumber: user.accountNumber,
        username: user.username,
        maskedPhone,
        maskedEmail,
        firstName: user.firstName
      }
    });
  } catch (error) {
    console.error('[OTP] Verify email error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error. Please try again.' 
    });
  }
};

/**
 * Send OTP for forgot password flow
 * POST /api/otp/forgot-password/send
 */
exports.sendForgotPasswordOtp = async (req, res) => {
  try {
    const { email, accountNumber } = req.body;

    if (!email && !accountNumber) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email or account number is required' 
      });
    }

    const user = await User.findOne(
      email 
        ? { email: { $regex: new RegExp(`^${email.trim()}$`, 'i') } }
        : { accountNumber }
    );

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Invalidate existing OTPs
    await Otp.updateMany(
      { accountNumber: user.accountNumber, type: 'forgot-password', used: false },
      { used: true }
    );

    const otp = String(Math.floor(100000 + Math.random() * 900000));

    const otpRecord = new Otp({
      accountNumber: user.accountNumber,
      userId: user._id,
      otp,
      type: 'forgot-password',
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      used: false
    });

    await otpRecord.save();

    const emailResult = await sendOtpEmail(user.email, otp, user.firstName);
    let smsResult = { success: false };
    if (user.phone) {
      smsResult = await sendOtpSms(user.phone, otp, user.firstName);
    }

    console.log(`\n========================================`);
    console.log(`[FORGOT PASSWORD OTP]`);
    console.log(`User: ${user.firstName} ${user.lastName}`);
    console.log(`Email: ${user.email} - Sent: ${emailResult.success ? '✅' : '❌'}`);
    console.log(`Phone: ${user.phone} - Sent: ${smsResult.success ? '✅' : '❌'}`);
    console.log(`OTP: ${otp}`);
    console.log(`Expires: ${otpRecord.expiresAt}`);
    console.log(`========================================\n`);

    let deliveryMessage = '';
    if (emailResult.success && smsResult.success) {
      deliveryMessage = `OTP has been sent to your email (${user.email}) and phone (****${user.phone?.slice(-4)})`;
    } else if (emailResult.success) {
      deliveryMessage = `OTP has been sent to your email (${user.email})`;
    } else if (smsResult.success) {
      deliveryMessage = `OTP has been sent to your phone (****${user.phone?.slice(-4)})`;
    } else {
      deliveryMessage = 'OTP generated. Please check your email/phone.';
    }

    res.status(201).json({
      success: true,
      message: deliveryMessage,
      data: {
        expiresAt: otpRecord.expiresAt,
        accountNumber: user.accountNumber,
        emailSent: emailResult.success,
        smsSent: smsResult.success
      }
    });
  } catch (error) {
    console.error('[OTP] Send forgot password OTP error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error. Please try again.' 
    });
  }
};

/**
 * Verify OTP for forgot password flow
 * POST /api/otp/forgot-password/verify
 */
exports.verifyForgotPasswordOtp = async (req, res) => {
  try {
    const { accountNumber, otp } = req.body;

    if (!accountNumber || !otp) {
      return res.status(400).json({ 
        success: false, 
        message: 'Account number and OTP are required' 
      });
    }

    const otpRecord = await Otp.findOne({
      accountNumber,
      otp,
      type: 'forgot-password',
      used: false,
      expiresAt: { $gt: new Date() }
    });

    if (!otpRecord) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired OTP. Please request a new one.' 
      });
    }

    otpRecord.used = true;
    await otpRecord.save();

    const resetToken = require('crypto').randomBytes(32).toString('hex');
    
    await User.updateOne(
      { accountNumber },
      { 
        resetToken,
        resetTokenExpiry: new Date(Date.now() + 10 * 60 * 1000)
      }
    );

    console.log(`[OTP] Verified successfully for account: ${accountNumber}`);

    res.json({
      success: true,
      message: 'OTP verified successfully. You can now reset your password.',
      data: {
        resetToken,
        accountNumber
      }
    });
  } catch (error) {
    console.error('[OTP] Verify OTP error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error. Please try again.' 
    });
  }
};

/**
 * Reset password after OTP verification
 * POST /api/otp/reset-password
 */
exports.resetPassword = async (req, res) => {
  try {
    const { accountNumber, resetToken, newPassword } = req.body;

    if (!accountNumber || !resetToken || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Account number, reset token, and new password are required' 
      });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character (@$!%*?&)'
      });
    }

    const user = await User.findOne({
      accountNumber,
      resetToken,
      resetTokenExpiry: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired reset token. Please start the password recovery process again.' 
      });
    }

    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    console.log(`[PASSWORD] Password reset successful for account: ${accountNumber}`);

    res.json({
      success: true,
      message: 'Password has been reset successfully. You can now login with your new password.'
    });
  } catch (error) {
    console.error('[OTP] Reset password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error. Please try again.' 
    });
  }
};


/**
 * Send OTP for registration email verification
 * POST /api/otp/registration/send
 */
exports.sendRegistrationOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }

    

    const existingUser = await User.findOne({ 
      email: { $regex: new RegExp(`^${email.trim()}$`, 'i') } 
    });

    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'This email is already registered. Please use a different email or login to your existing account.' 
      });
    }

    await Otp.updateMany(
      { email: email.trim().toLowerCase(), type: 'registration', used: false },
      { used: true }
    );

    const otp = String(Math.floor(100000 + Math.random() * 900000));

    const otpRecord = new Otp({
      email: email.trim().toLowerCase(),
      otp,
      type: 'registration',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      used: false
    });

    await otpRecord.save();

    const transporter = createTransporter();

    const mailOptions = {
      from: '"VJN Cooperative Bank" <vjncobank@gmail.com>',
      to: email,
      subject: 'VJN Bank - Email Verification OTP',
      html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification OTP</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 40px 0;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                <tr>
                  <td style="background: linear-gradient(135deg, #0d1b3e 0%, #1e3a7a 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
                    <h1 style="color: #c9a84c; margin: 0; font-size: 28px;">VJN Cooperative Bank</h1>
                    <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 14px;">Secure Banking, Trusted Service</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 40px 30px;">
                    <h2 style="color: #0d1b3e; margin: 0 0 20px 0; font-size: 24px;">Verify Your Email Address</h2>
                    <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                      Thank you for choosing VJN Cooperative Bank! Please use the following OTP to verify your email address and complete your registration:
                    </p>
                    <div style="background: linear-gradient(135deg, #0d1b3e 0%, #1e3a7a 100%); border-radius: 12px; padding: 30px; text-align: center; margin: 0 0 30px 0;">
                      <p style="color: #c9a84c; font-size: 14px; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 2px;">Your Verification Code</p>
                      <h1 style="color: #ffffff; font-size: 42px; letter-spacing: 8px; margin: 0; font-family: 'Courier New', monospace;">${otp}</h1>
                    </div>
                    <div style="background: #e8f5e9; border-left: 4px solid #28a745; padding: 15px 20px; margin: 0 0 30px 0; border-radius: 0 8px 8px 0;">
                      <p style="color: #2e7d32; font-size: 14px; margin: 0;">
                        <strong>This OTP is valid for 10 minutes.</strong><br>
                        Do not share this code with anyone.
                      </p>
                    </div>
                    <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 0;">
                      If you did not initiate this registration, please ignore this email.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="background: #f8f9fa; padding: 25px 30px; text-align: center; border-radius: 0 0 12px 12px; border-top: 1px solid #eee;">
                    <p style="color: #666; font-size: 12px; margin: 0 0 10px 0;">
                      This is an automated message from VJN Cooperative Bank. Please do not reply.
                    </p>
                    <p style="color: #999; font-size: 11px; margin: 0;">
                      © ${new Date().getFullYear()} VJN Cooperative Bank. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log(`\n========================================`);
    console.log(`[REGISTRATION EMAIL VERIFICATION]`);
    console.log(`Email: ${email}`);
    console.log(`OTP: ${otp}`);
    console.log(`MessageId: ${info.messageId}`);
    console.log(`Expires: ${otpRecord.expiresAt}`);
    console.log(`========================================\n`);

    res.status(201).json({
      success: true,
      message: `Verification OTP sent to ${email}`,
      data: {
        expiresAt: otpRecord.expiresAt
      }
    });
  } catch (error) {
    console.error('[OTP] Registration email send error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send OTP. Please try again.' 
    });
  }
};

/**
 * Verify OTP for registration email verification
 * POST /api/otp/registration/verify
 */
exports.verifyRegistrationOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    console.log(`[OTP] Verifying registration OTP for email: ${email}, OTP: ${otp}`);

    if (!email || !otp) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and OTP are required' 
      });
    }

    const searchEmail = email.trim().toLowerCase();
    const searchOtp = otp.trim();

    const allOtps = await Otp.find({ 
      email: searchEmail, 
      type: 'registration' 
    }).sort({ createdAt: -1 }).limit(5);

    console.log(`[OTP] Found ${allOtps.length} registration OTPs for ${searchEmail}:`);
    allOtps.forEach((o, i) => {
      console.log(`  ${i + 1}. OTP: ${o.otp}, Used: ${o.used}, Expires: ${o.expiresAt}, Now: ${new Date()}`);
    });

    const otpRecord = await Otp.findOne({
      email: searchEmail,
      otp: searchOtp,
      type: 'registration',
      used: false,
      expiresAt: { $gt: new Date() }
    });

    if (!otpRecord) {
      console.log(`[OTP] ❌ No valid OTP found for ${searchEmail} with code ${searchOtp}`);
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired OTP. Please request a new one.' 
      });
    }

    otpRecord.used = true;
    otpRecord.verifiedAt = new Date();
    await otpRecord.save();

    console.log(`[OTP] ✅ Registration email verified: ${email}`);

    res.json({
      success: true,
      message: 'Email verified successfully! You can now complete your registration.',
      data: {
        email: email,
        verified: true,
        verifiedAt: otpRecord.verifiedAt
      }
    });
  } catch (error) {
    console.error('[OTP] Registration verify error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error. Please try again.' 
    });
  }
};
