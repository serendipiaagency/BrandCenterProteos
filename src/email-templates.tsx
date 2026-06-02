// Email Templates for Brand Center

export const emailTemplates = {
  // Template for new user registration
  newUserWelcome: (name: string, email: string, password: string, loginUrl: string) => ({
    subject: 'Welcome to Brand Center - Your Account is Ready',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Brand Center</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f7fa; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                
                <!-- Header -->
                <tr>
                  <td style="background-color: #002f57; padding: 40px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">
                      Welcome to Brand Center
                    </h1>
                    <p style="color: #e0e7ff; margin: 10px 0 0 0; font-size: 16px;">
                      Proteos Biotech
                    </p>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px;">
                    <p style="color: #1a202c; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                      Hello <strong>${name}</strong>,
                    </p>
                    
                    <p style="color: #4a5568; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">
                      Your Brand Center account has been created successfully. You now have access to all marketing materials, brand assets, and resources.
                    </p>
                    
                    <!-- Credentials Box -->
                    <div style="background-color: #f7fafc; border-left: 4px solid #002f57; padding: 20px; margin: 30px 0; border-radius: 4px;">
                      <p style="color: #2d3748; font-size: 14px; font-weight: 600; margin: 0 0 12px 0;">
                        Your Login Credentials:
                      </p>
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="color: #718096; font-size: 14px; padding: 6px 0;">Email:</td>
                          <td style="color: #1a202c; font-size: 14px; font-weight: 600; padding: 6px 0;">${email}</td>
                        </tr>
                        <tr>
                          <td style="color: #718096; font-size: 14px; padding: 6px 0;">Password:</td>
                          <td style="color: #1a202c; font-size: 14px; font-weight: 600; font-family: 'Courier New', monospace; padding: 6px 0;">${password}</td>
                        </tr>
                      </table>
                      <p style="color: #e53e3e; font-size: 13px; margin: 15px 0 0 0; font-style: italic;">
                        ⚠️ Please change your password after your first login for security.
                      </p>
                    </div>
                    
                    <!-- CTA Button -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td align="center" style="padding: 35px 0;">
                          <a href="${loginUrl}" style="display: inline-block; background-color: #002f57; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; font-family: Arial, sans-serif;">
                            Access Brand Center
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                    <p style="color: #718096; font-size: 13px; margin: 0 0 10px 0;">
                      © ${new Date().getFullYear()} Proteos Biotech. All rights reserved.
                    </p>
                    <p style="color: #a0aec0; font-size: 12px; margin: 0;">
                      Brand Center | Marketing Asset Management System
                    </p>
                  </td>
                </tr>
                
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
    text: `
Welcome to Brand Center - Proteos Biotech

Hello ${name},

Your Brand Center account has been created successfully. You now have access to all marketing materials, brand assets, and resources.

Your Login Credentials:
Email: ${email}
Password: ${password}

⚠️ Please change your password after your first login for security.

Access Brand Center: ${loginUrl}

If you have any questions or need assistance, please contact our support team at:
brandcenter@pbserum.com

© ${new Date().getFullYear()} Proteos Biotech. All rights reserved.
    `
  }),

  // Template for password reset
  passwordReset: (name: string, resetLink: string) => ({
    subject: 'Reset Your Brand Center Password',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f7fa; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                
                <!-- Header -->
                <tr>
                  <td style="background-color: #002f57; padding: 40px; text-align: center;">
                    <div style="background-color: rgba(255,255,255,0.1); width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: table-cell; vertical-align: middle; text-align: center;">
                      <span style="color: #ffffff; font-size: 40px;">🔑</span>
                    </div>
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">
                      Password Reset Request
                    </h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px;">
                    <p style="color: #1a202c; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                      Hello <strong>${name}</strong>,
                    </p>
                    
                    <p style="color: #4a5568; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">
                      We received a request to reset your Brand Center password. Click the button below to create a new password:
                    </p>
                    
                    <!-- CTA Button -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td align="center" style="padding: 35px 0;">
                          <a href="${resetLink}" style="display: inline-block; background-color: #002f57; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; font-family: Arial, sans-serif;">
                            Reset Password
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Security Info -->
                    <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 20px; margin: 30px 0; border-radius: 4px;">
                      <p style="color: #92400e; font-size: 14px; margin: 0 0 10px 0; font-weight: 600;">
                        🔒 Security Notice:
                      </p>
                      <ul style="color: #78350f; font-size: 13px; margin: 0; padding-left: 20px; line-height: 1.6;">
                        <li>This link will expire in <strong>1 hour</strong></li>
                        <li>If you didn't request this reset, please ignore this email</li>
                        <li>Your password will not change until you create a new one</li>
                      </ul>
                    </div>
                    
                    <p style="color: #718096; font-size: 13px; line-height: 1.6; margin: 25px 0 0 0; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                      Or copy and paste this URL into your browser:<br>
                      <span style="color: #4299e1; word-break: break-all;">${resetLink}</span>
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                    <p style="color: #718096; font-size: 13px; margin: 0 0 10px 0;">
                      © ${new Date().getFullYear()} Proteos Biotech. All rights reserved.
                    </p>
                    <p style="color: #a0aec0; font-size: 12px; margin: 0;">
                      Brand Center | Marketing Asset Management System
                    </p>
                  </td>
                </tr>
                
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
    text: `
Password Reset Request - Brand Center

Hello ${name},

We received a request to reset your Brand Center password. Click the link below to create a new password:

${resetLink}

Security Notice:
- This link will expire in 1 hour
- If you didn't request this reset, please ignore this email
- Your password will not change until you create a new one

© ${new Date().getFullYear()} Proteos Biotech. All rights reserved.
    `
  }),

  // Template for password changed confirmation
  passwordChanged: (name: string, email: string) => ({
    subject: 'Your Brand Center Password Has Been Changed',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Changed Successfully</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f7fa; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                
                <!-- Header -->
                <tr>
                  <td style="background-color: #059669; padding: 40px; text-align: center;">
                    <div style="background-color: rgba(255,255,255,0.2); width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: table-cell; vertical-align: middle; text-align: center;">
                      <span style="color: #ffffff; font-size: 40px;">✓</span>
                    </div>
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">
                      Password Changed Successfully
                    </h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px;">
                    <p style="color: #1a202c; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                      Hello <strong>${name}</strong>,
                    </p>
                    
                    <p style="color: #4a5568; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">
                      This is a confirmation that your Brand Center password has been successfully changed.
                    </p>
                    
                    <!-- Info Box -->
                    <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 20px; margin: 25px 0; border-radius: 4px;">
                      <p style="color: #065f46; font-size: 14px; margin: 0;">
                        <strong>Account:</strong> ${email}<br>
                        <strong>Changed:</strong> ${new Date().toLocaleString('en-US', { 
                          dateStyle: 'full', 
                          timeStyle: 'short' 
                        })}
                      </p>
                    </div>
                    
                    <!-- Security Alert -->
                    <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; margin: 25px 0; border-radius: 4px;">
                      <p style="color: #991b1b; font-size: 14px; margin: 0 0 10px 0; font-weight: 600;">
                        ⚠️ Didn't make this change?
                      </p>
                      <p style="color: #7f1d1d; font-size: 13px; margin: 0; line-height: 1.6;">
                        If you did not change your password, please contact support immediately or reset your password right away.
                      </p>
                    </div>
                    
                    <!-- Support Contact CTA -->
                    <div style="text-align: center; margin: 25px 0;">
                      <a href="mailto:brandcenter@pbserum.com" style="display: inline-block; background-color: #fef2f2; color: #991b1b; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-size: 14px; font-weight: 600; border: 2px solid #ef4444;">
                        📧 Contact Support: brandcenter@pbserum.com
                      </a>
                    </div>
                    
                    <p style="color: #718096; font-size: 14px; line-height: 1.6; margin: 25px 0 0 0;">
                      Thank you for using Brand Center securely.
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                    <p style="color: #718096; font-size: 13px; margin: 0 0 10px 0;">
                      © ${new Date().getFullYear()} Proteos Biotech. All rights reserved.
                    </p>
                    <p style="color: #a0aec0; font-size: 12px; margin: 0;">
                      Brand Center | Marketing Asset Management System
                    </p>
                  </td>
                </tr>
                
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
    text: `
Password Changed Successfully - Brand Center

Hello ${name},

This is a confirmation that your Brand Center password has been successfully changed.

Account: ${email}
Changed: ${new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}

⚠️ Didn't make this change?
If you did not change your password, please contact support immediately at brandcenter@pbserum.com or reset your password right away.

Thank you for using Brand Center securely.

© ${new Date().getFullYear()} Proteos Biotech. All rights reserved.
    `
  })
}
