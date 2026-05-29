const nodemailer = require('nodemailer');

// ============ EMAIL TRANSPORTER CONFIGURATION ============
const transporter = nodemailer.createTransport({
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

// ============ EMAIL TEMPLATES ============

// Registration confirmation email
const sendRegistrationEmail = async (email, firstName, lastName, accountNumber) => {
  try {
    const mailOptions = {
      from: '"VJN Cooperative Bank" <vjncobank@gmail.com>',
      to: email,
      subject: 'Welcome to VJN Bank - Registration Successful',
      html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Registration Successful</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 40px 0;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #0d1b3e 0%, #1e3a7a 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
                    <h1 style="color: #c9a84c; margin: 0; font-size: 28px;">VJN Cooperative Bank</h1>
                    <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 14px;">Secure Banking, Trusted Service</p>
                  </td>
                </tr>
                <!-- Body -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                      <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #28a745 0%, #20c997 100%); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                        <span style="font-size: 40px;">✓</span>
                      </div>
                      <h2 style="color: #0d1b3e; margin: 0; font-size: 24px;">Thank You for Registering!</h2>
                    </div>
                    
                    <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                      Dear <strong>${firstName} ${lastName}</strong>,
                    </p>
                    <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                      Thank you for choosing VJN Cooperative Bank. Your registration has been received successfully and is currently under review.
                    </p>
                    
                    <!-- Account Details Box -->
                    <div style="background: linear-gradient(135deg, #0d1b3e 0%, #1e3a7a 100%); border-radius: 12px; padding: 25px; text-align: center; margin: 30px 0;">
                      <p style="color: #c9a84c; font-size: 14px; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 2px;">Your Account Number</p>
                      <h1 style="color: #ffffff; font-size: 32px; letter-spacing: 3px; margin: 0; font-family: 'Courier New', monospace;">${accountNumber}</h1>
                      <p style="color: #aaa; font-size: 12px; margin: 15px 0 0 0;">Please save this for future reference</p>
                    </div>
                    
                    <!-- Status Info -->
                    <div style="background: #fff8e1; border-left: 4px solid #c9a84c; padding: 15px 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
                      <p style="color: #856404; font-size: 14px; margin: 0;">
                        <strong>⏳ Status: Pending Approval</strong><br>
                        Your account is being reviewed by our team. You will receive another email once your account is approved and ready to use.
                      </p>
                    </div>
                    
                    <h3 style="color: #0d1b3e; margin: 30px 0 15px 0; font-size: 18px;">What Happens Next?</h3>
                    <ol style="color: #555; font-size: 14px; line-height: 1.8; padding-left: 20px; margin: 0;">
                      <li>Our team will verify your KYC documents</li>
                      <li>Once verified, your account will be approved</li>
                      <li>You'll receive a confirmation email</li>
                      <li>Login and start banking with us!</li>
                    </ol>
                    
                    <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
                      If you have any questions, please contact our support team at <a href="mailto:support@vjnbank.com" style="color: #1e3a7a;">support@vjnbank.com</a>
                    </p>
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="background: #f8f9fa; padding: 25px 30px; text-align: center; border-radius: 0 0 12px 12px; border-top: 1px solid #eee;">
                    <p style="color: #666; font-size: 12px; margin: 0 0 10px 0;">
                      This is an automated message from VJN Cooperative Bank. Please do not reply to this email.
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
    console.log(`[EMAIL] ✅ Registration email sent to ${email}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[EMAIL] ❌ Error sending registration email:', error.message);
    return { success: false, error: error.message };
  }
};

// Account approval email
const sendApprovalEmail = async (email, firstName, lastName, accountNumber, username) => {
  try {
    const mailOptions = {
      from: '"VJN Cooperative Bank" <vjncobank@gmail.com>',
      to: email,
      subject: '🎉 Congratulations! Your VJN Bank Account is Approved',
      html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Account Approved</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 40px 0;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #0d1b3e 0%, #1e3a7a 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
                    <h1 style="color: #c9a84c; margin: 0; font-size: 28px;">VJN Cooperative Bank</h1>
                    <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 14px;">Secure Banking, Trusted Service</p>
                  </td>
                </tr>
                <!-- Body -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                      <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #28a745 0%, #20c997 100%); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                        <span style="font-size: 40px;">🎉</span>
                      </div>
                      <h2 style="color: #0d1b3e; margin: 0; font-size: 24px;">Welcome to VJN Bank!</h2>
                      <p style="color: #28a745; font-size: 16px; margin: 10px 0 0 0; font-weight: bold;">Your Account Has Been Approved</p>
                    </div>
                    
                    <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                      Dear <strong>${firstName} ${lastName}</strong>,
                    </p>
                    <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                      Congratulations! We are pleased to inform you that your VJN Cooperative Bank account has been verified and approved. Your account is now <strong style="color: #28a745;">ready to use</strong>!
                    </p>
                    
                    <!-- Account Details Box -->
                    <div style="background: linear-gradient(135deg, #0d1b3e 0%, #1e3a7a 100%); border-radius: 12px; padding: 25px; margin: 30px 0;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                            <span style="color: #c9a84c; font-size: 12px; text-transform: uppercase;">Account Number</span><br>
                            <span style="color: #ffffff; font-size: 18px; font-family: 'Courier New', monospace;">${accountNumber}</span>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                            <span style="color: #c9a84c; font-size: 12px; text-transform: uppercase;">Username</span><br>
                            <span style="color: #ffffff; font-size: 18px;">${username}</span>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 10px 0;">
                            <span style="color: #c9a84c; font-size: 12px; text-transform: uppercase;">Account Status</span><br>
                            <span style="color: #28a745; font-size: 18px; font-weight: bold;">✓ Active</span>
                          </td>
                        </tr>
                      </table>
                    </div>
                    
                    <!-- CTA Button -->
                    <div style="text-align: center; margin: 30px 0;">
                      <a href="http://localhost:5173/login" style="display: inline-block; background: linear-gradient(135deg, #c9a84c 0%, #b8963f 100%); color: #0d1b3e; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-weight: bold; font-size: 16px;">
                        Login to Your Account
                      </a>
                    </div>
                    
                    <!-- Services -->
                    <h3 style="color: #0d1b3e; margin: 30px 0 15px 0; font-size: 18px;">Start Using Our Services</h3>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="50%" style="padding: 10px;">
                          <div style="background: #f8f9fa; border-radius: 8px; padding: 15px; text-align: center;">
                            <span style="font-size: 24px;">💸</span>
                            <p style="color: #333; font-size: 14px; margin: 10px 0 0 0;">Fund Transfer</p>
                          </div>
                        </td>
                        <td width="50%" style="padding: 10px;">
                          <div style="background: #f8f9fa; border-radius: 8px; padding: 15px; text-align: center;">
                            <span style="font-size: 24px;">📊</span>
                            <p style="color: #333; font-size: 14px; margin: 10px 0 0 0;">View Transactions</p>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td width="50%" style="padding: 10px;">
                          <div style="background: #f8f9fa; border-radius: 8px; padding: 15px; text-align: center;">
                            <span style="font-size: 24px;">🔒</span>
                            <p style="color: #333; font-size: 14px; margin: 10px 0 0 0;">Locker Booking</p>
                          </div>
                        </td>
                        <td width="50%" style="padding: 10px;">
                          <div style="background: #f8f9fa; border-radius: 8px; padding: 15px; text-align: center;">
                            <span style="font-size: 24px;">🛎️</span>
                            <p style="color: #333; font-size: 14px; margin: 10px 0 0 0;">Service Requests</p>
                          </div>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Security Notice -->
                    <div style="background: #e8f5e9; border-left: 4px solid #28a745; padding: 15px 20px; margin: 30px 0; border-radius: 0 8px 8px 0;">
                      <p style="color: #2e7d32; font-size: 14px; margin: 0;">
                        <strong>🔐 Security Reminder:</strong><br>
                        Never share your password or OTP with anyone. VJN Bank will never ask for your sensitive information via email or phone.
                      </p>
                    </div>
                    
                    <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                      Thank you for banking with us. We're excited to have you as our valued customer!
                    </p>
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="background: #f8f9fa; padding: 25px 30px; text-align: center; border-radius: 0 0 12px 12px; border-top: 1px solid #eee;">
                    <p style="color: #666; font-size: 12px; margin: 0 0 10px 0;">
                      Need help? Contact us at <a href="mailto:support@vjnbank.com" style="color: #1e3a7a;">support@vjnbank.com</a>
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
    console.log(`[EMAIL] ✅ Approval email sent to ${email}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[EMAIL] ❌ Error sending approval email:', error.message);
    return { success: false, error: error.message };
  }
};

// Account rejection email
const sendRejectionEmail = async (email, firstName, lastName, accountNumber, reason = '') => {
  try {
    const mailOptions = {
      from: '"VJN Cooperative Bank" <vjncobank@gmail.com>',
      to: email,
      subject: 'VJN Bank - Account Application Update',
      html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Account Application Update</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 40px 0;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #0d1b3e 0%, #1e3a7a 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
                    <h1 style="color: #c9a84c; margin: 0; font-size: 28px;">VJN Cooperative Bank</h1>
                    <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 14px;">Secure Banking, Trusted Service</p>
                  </td>
                </tr>
                <!-- Body -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <h2 style="color: #0d1b3e; margin: 0 0 20px 0; font-size: 24px;">Account Application Update</h2>
                    
                    <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                      Dear <strong>${firstName} ${lastName}</strong>,
                    </p>
                    <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                      We regret to inform you that your account application (Account No: <strong>${accountNumber}</strong>) could not be approved at this time.
                    </p>
                    
                    ${reason ? `
                    <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
                      <p style="color: #856404; font-size: 14px; margin: 0;">
                        <strong>Reason:</strong> ${reason}
                      </p>
                    </div>
                    ` : ''}
                    
                    <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 20px 0;">
                      You may reapply with the correct documents or contact our support team for assistance.
                    </p>
                    
                    <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
                      If you have any questions, please contact our support team at <a href="mailto:support@vjnbank.com" style="color: #1e3a7a;">support@vjnbank.com</a>
                    </p>
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="background: #f8f9fa; padding: 25px 30px; text-align: center; border-radius: 0 0 12px 12px; border-top: 1px solid #eee;">
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
    console.log(`[EMAIL] ✅ Rejection email sent to ${email}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[EMAIL] ❌ Error sending rejection email:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendRegistrationEmail,
  sendApprovalEmail,
  sendRejectionEmail
};
