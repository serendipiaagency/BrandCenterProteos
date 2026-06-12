// Email Templates for Brand Center

export const emailTemplates = {
  // Template for new user registration
  newUserWelcome: (name: string, email: string, password: string, loginUrl: string) => ({
    subject: 'Welcome to Brand Center - Your Account is Ready',
    html: `<!DOCTYPE html>
<html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Welcome to Brand Center</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#f4f7fa;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f7fa;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <!--[if mso]>
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0"><tr><td>
        <![endif]-->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background-color:#ffffff;">

          <!-- Header -->
          <tr>
            <td align="center" bgcolor="#002f57" style="background-color:#002f57;padding:40px;">
              <h1 style="color:#ffffff;margin:0;font-size:28px;font-weight:600;font-family:Arial,sans-serif;">
                Welcome to Brand Center
              </h1>
              <p style="color:#c8d8e8;margin:10px 0 0 0;font-size:16px;font-family:Arial,sans-serif;">
                Proteos Biotech
              </p>
            </td>
          </tr>

          <!-- Content: greeting + credentials (white background) -->
          <tr>
            <td style="padding:40px 40px 32px 40px;background-color:#ffffff;">

              <p style="color:#1a202c;font-size:16px;line-height:1.6;margin:0 0 20px 0;font-family:Arial,sans-serif;">
                Hello <strong>${name}</strong>,
              </p>

              <p style="color:#4a5568;font-size:15px;line-height:1.6;margin:0 0 28px 0;font-family:Arial,sans-serif;">
                Your Brand Center account has been created successfully. You now have access to all marketing materials, brand assets, and resources.
              </p>

              <!-- Credentials Box -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background-color:#f7fafc;border-left:4px solid #002f57;padding:20px;">
                    <p style="color:#2d3748;font-size:14px;font-weight:700;margin:0 0 12px 0;font-family:Arial,sans-serif;">
                      Your Login Credentials:
                    </p>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td width="90" style="color:#718096;font-size:14px;padding:5px 0;font-family:Arial,sans-serif;">Email:</td>
                        <td style="color:#1a202c;font-size:14px;font-weight:700;padding:5px 0;font-family:Arial,sans-serif;">${email}</td>
                      </tr>
                      <tr>
                        <td width="90" style="color:#718096;font-size:14px;padding:5px 0;font-family:Arial,sans-serif;">Password:</td>
                        <td style="color:#1a202c;font-size:14px;font-weight:700;padding:5px 0;font-family:'Courier New',Courier,monospace;">${password}</td>
                      </tr>
                    </table>
                    <p style="color:#c53030;font-size:13px;margin:15px 0 0 0;font-style:italic;font-family:Arial,sans-serif;">
                      Please change your password after your first login for security.
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- CTA Section — dark blue, same as header -->
          <tr>
            <td align="center" bgcolor="#002f57" style="background-color:#002f57;padding:40px 40px 44px 40px;">

              <p style="color:#c8d8e8;font-size:15px;margin:0 0 28px 0;font-family:Arial,sans-serif;line-height:1.5;">
                Use your credentials above to log in and start<br>accessing all your brand materials.
              </p>

              <!-- White button on dark blue — maximum visibility in all email clients -->
              <!--[if mso]>
              <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${loginUrl}" style="height:56px;v-text-anchor:middle;width:260px;" arcsize="12%" stroke="f" fillcolor="#ffffff">
                <w:anchorlock/>
                <center style="color:#002f57;font-family:Arial,sans-serif;font-size:17px;font-weight:bold;">Access Brand Center</center>
              </v:roundrect>
              <![endif]-->
              <!--[if !mso]><!-->
              <a href="${loginUrl}" style="background-color:#ffffff;border-radius:8px;color:#002f57;display:inline-block;font-family:Arial,sans-serif;font-size:17px;font-weight:800;line-height:56px;text-align:center;text-decoration:none;width:260px;mso-hide:all;">
                Access Brand Center
              </a>
              <!--<![endif]-->

              <p style="color:#6b8caa;font-size:12px;margin:22px 0 0 0;font-family:Arial,sans-serif;">
                Having trouble? Contact <a href="mailto:brandcenter@pbserum.com" style="color:#93c5fd;text-decoration:none;">brandcenter@pbserum.com</a>
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td bgcolor="#f7fafc" align="center" style="background-color:#f7fafc;padding:30px;border-top:1px solid #e2e8f0;">
              <p style="color:#718096;font-size:13px;margin:0 0 8px 0;font-family:Arial,sans-serif;">
                &copy; ${new Date().getFullYear()} Proteos Biotech. All rights reserved.
              </p>
              <p style="color:#a0aec0;font-size:12px;margin:0;font-family:Arial,sans-serif;">
                Brand Center | Marketing Asset Management System
              </p>
            </td>
          </tr>

        </table>
        <!--[if mso]>
        </td></tr></table>
        <![endif]-->
      </td>
    </tr>
  </table>
</body>
</html>`,
    text: `Welcome to Brand Center - Proteos Biotech

Hello ${name},

Your Brand Center account has been created successfully.

Your Login Credentials:
Email: ${email}
Password: ${password}

Please change your password after your first login for security.

Access Brand Center: ${loginUrl}

© ${new Date().getFullYear()} Proteos Biotech. All rights reserved.`
  }),

  // Template for password reset
  passwordReset: (name: string, resetLink: string) => ({
    subject: 'Reset Your Brand Center Password',
    html: `<!DOCTYPE html>
<html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Reset Your Password</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#f4f7fa;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f7fa;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <!--[if mso]>
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0"><tr><td>
        <![endif]-->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background-color:#ffffff;">

          <!-- Header -->
          <tr>
            <td align="center" bgcolor="#002f57" style="background-color:#002f57;padding:40px;">
              <h1 style="color:#ffffff;margin:0;font-size:28px;font-weight:600;font-family:Arial,sans-serif;">
                Password Reset Request
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:40px;">

              <p style="color:#1a202c;font-size:16px;line-height:1.6;margin:0 0 20px 0;font-family:Arial,sans-serif;">
                Hello <strong>${name}</strong>,
              </p>

              <p style="color:#4a5568;font-size:15px;line-height:1.6;margin:0 0 20px 0;font-family:Arial,sans-serif;">
                We received a request to reset your Brand Center password. Click the button below to create a new password:
              </p>

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="padding:20px 0 35px 0;">
                    <!--[if mso]>
                    <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${resetLink}" style="height:54px;v-text-anchor:middle;width:200px;" arcsize="15%" stroke="f" fillcolor="#002f57">
                      <w:anchorlock/>
                      <center style="color:#ffffff;font-family:Arial,sans-serif;font-size:16px;font-weight:bold;">Reset Password</center>
                    </v:roundrect>
                    <![endif]-->
                    <!--[if !mso]><!-->
                    <a href="${resetLink}" style="background-color:#002f57;border-radius:8px;color:#ffffff;display:inline-block;font-family:Arial,sans-serif;font-size:16px;font-weight:700;line-height:54px;text-align:center;text-decoration:none;width:200px;mso-hide:all;">
                      Reset Password
                    </a>
                    <!--<![endif]-->
                  </td>
                </tr>
              </table>

              <!-- Security Info -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:10px 0 30px 0;">
                <tr>
                  <td style="background-color:#fffbeb;border-left:4px solid #f59e0b;padding:20px;">
                    <p style="color:#92400e;font-size:14px;margin:0 0 10px 0;font-weight:700;font-family:Arial,sans-serif;">
                      Security Notice:
                    </p>
                    <p style="color:#78350f;font-size:13px;margin:0 0 6px 0;font-family:Arial,sans-serif;">- This link will expire in <strong>1 hour</strong></p>
                    <p style="color:#78350f;font-size:13px;margin:0 0 6px 0;font-family:Arial,sans-serif;">- If you didn't request this reset, please ignore this email</p>
                    <p style="color:#78350f;font-size:13px;margin:0;font-family:Arial,sans-serif;">- Your password will not change until you create a new one</p>
                  </td>
                </tr>
              </table>

              <p style="color:#718096;font-size:13px;line-height:1.6;margin:25px 0 0 0;padding-top:20px;border-top:1px solid #e2e8f0;font-family:Arial,sans-serif;">
                Or copy and paste this URL into your browser:<br>
                <span style="color:#4299e1;word-break:break-all;">${resetLink}</span>
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td bgcolor="#f7fafc" align="center" style="background-color:#f7fafc;padding:30px;border-top:1px solid #e2e8f0;">
              <p style="color:#718096;font-size:13px;margin:0 0 8px 0;font-family:Arial,sans-serif;">
                &copy; ${new Date().getFullYear()} Proteos Biotech. All rights reserved.
              </p>
              <p style="color:#a0aec0;font-size:12px;margin:0;font-family:Arial,sans-serif;">
                Brand Center | Marketing Asset Management System
              </p>
            </td>
          </tr>

        </table>
        <!--[if mso]>
        </td></tr></table>
        <![endif]-->
      </td>
    </tr>
  </table>
</body>
</html>`,
    text: `Password Reset Request - Brand Center

Hello ${name},

We received a request to reset your Brand Center password.
Click the link below to create a new password:

${resetLink}

Security Notice:
- This link will expire in 1 hour
- If you didn't request this reset, please ignore this email
- Your password will not change until you create a new one

© ${new Date().getFullYear()} Proteos Biotech. All rights reserved.`
  }),

  // Template for password changed confirmation
  passwordChanged: (name: string, email: string) => ({
    subject: 'Your Brand Center Password Has Been Changed',
    html: `<!DOCTYPE html>
<html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Password Changed Successfully</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#f4f7fa;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f7fa;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <!--[if mso]>
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0"><tr><td>
        <![endif]-->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background-color:#ffffff;">

          <!-- Header -->
          <tr>
            <td align="center" bgcolor="#059669" style="background-color:#059669;padding:40px;">
              <h1 style="color:#ffffff;margin:0;font-size:28px;font-weight:600;font-family:Arial,sans-serif;">
                Password Changed Successfully
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:40px;">

              <p style="color:#1a202c;font-size:16px;line-height:1.6;margin:0 0 20px 0;font-family:Arial,sans-serif;">
                Hello <strong>${name}</strong>,
              </p>

              <p style="color:#4a5568;font-size:15px;line-height:1.6;margin:0 0 20px 0;font-family:Arial,sans-serif;">
                This is a confirmation that your Brand Center password has been successfully changed.
              </p>

              <!-- Info Box -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:25px 0;">
                <tr>
                  <td style="background-color:#f0fdf4;border-left:4px solid #10b981;padding:20px;">
                    <p style="color:#065f46;font-size:14px;margin:0;font-family:Arial,sans-serif;">
                      <strong>Account:</strong> ${email}<br>
                      <strong>Changed:</strong> ${new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Security Alert -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:25px 0;">
                <tr>
                  <td style="background-color:#fef2f2;border-left:4px solid #ef4444;padding:20px;">
                    <p style="color:#991b1b;font-size:14px;margin:0 0 8px 0;font-weight:700;font-family:Arial,sans-serif;">
                      Didn't make this change?
                    </p>
                    <p style="color:#7f1d1d;font-size:13px;margin:0;line-height:1.6;font-family:Arial,sans-serif;">
                      If you did not change your password, please contact support immediately or reset your password right away.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="color:#718096;font-size:14px;line-height:1.6;margin:25px 0 0 0;font-family:Arial,sans-serif;">
                Thank you for using Brand Center securely.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td bgcolor="#f7fafc" align="center" style="background-color:#f7fafc;padding:30px;border-top:1px solid #e2e8f0;">
              <p style="color:#718096;font-size:13px;margin:0 0 8px 0;font-family:Arial,sans-serif;">
                &copy; ${new Date().getFullYear()} Proteos Biotech. All rights reserved.
              </p>
              <p style="color:#a0aec0;font-size:12px;margin:0;font-family:Arial,sans-serif;">
                Brand Center | Marketing Asset Management System
              </p>
            </td>
          </tr>

        </table>
        <!--[if mso]>
        </td></tr></table>
        <![endif]-->
      </td>
    </tr>
  </table>
</body>
</html>`,
    text: `Password Changed Successfully - Brand Center

Hello ${name},

This is a confirmation that your Brand Center password has been successfully changed.

Account: ${email}
Changed: ${new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}

If you did not change your password, please contact support immediately.

Thank you for using Brand Center securely.

© ${new Date().getFullYear()} Proteos Biotech. All rights reserved.`
  })
}
