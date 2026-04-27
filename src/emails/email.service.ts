import * as fs from 'fs';
import * as path from 'path';
import * as nodemailer from 'nodemailer';

const TEMPLATES_DIR = path.join(__dirname, 'templates');

function loadTemplate(name: string): string {
  return fs.readFileSync(path.join(TEMPLATES_DIR, `${name}.html`), 'utf-8');
}

function renderTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? '');
}

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function sendWelcomeEmail(params: {
  to: string;
  userName: string;
  userEmail: string;
  tempPassword: string;
  brandCenterUrl: string;
}) {
  const html = renderTemplate(loadTemplate('welcome'), {
    userName: params.userName,
    userEmail: params.userEmail,
    tempPassword: params.tempPassword,
    brandCenterUrl: params.brandCenterUrl,
  });

  await createTransporter().sendMail({
    from: `"Brand Center – Proteos Biotech" <${process.env.SMTP_FROM}>`,
    to: params.to,
    subject: 'Welcome to Brand Center – Your Login Credentials',
    html,
  });
}

export async function sendPasswordResetEmail(params: {
  to: string;
  userName: string;
  userEmail: string;
  tempPassword: string;
  brandCenterUrl: string;
}) {
  const html = renderTemplate(loadTemplate('password-reset'), {
    userName: params.userName,
    userEmail: params.userEmail,
    tempPassword: params.tempPassword,
    brandCenterUrl: params.brandCenterUrl,
  });

  await createTransporter().sendMail({
    from: `"Brand Center – Proteos Biotech" <${process.env.SMTP_FROM}>`,
    to: params.to,
    subject: 'Brand Center – Your New Password',
    html,
  });
}
