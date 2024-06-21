import { EmailTemplates, renderTemplate } from '../utils/email.utils';
import mailer from '../lib/email.server';
import config from '../config/config.service';

export type SendSetPasswordEmailTypePayload = EmailTemplates['set-password'] & {
  email: string;
};

export const sendSetPasswordEmail = async (
  payload: SendSetPasswordEmailTypePayload,
) => {
  const { email, name, passwordSetLink } = payload;

  await mailer.sendMail({
    from: config.EMAIL_FROM,
    to: email,
    subject: 'Account has been created, Set your password',
    html: renderTemplate('set-password', { name, passwordSetLink }),
  });
};

export type SendResetPasswordTypePayload = EmailTemplates['reset-password'] & {
  email: string;
};

export const sendResetPasswordEmail = async (
  payload: SendResetPasswordTypePayload,
) => {
  const { email, resetLink, userName } = payload;

  await mailer.sendMail({
    from: config.EMAIL_FROM,
    to: email,
    subject: 'Reset Your Password',
    html: renderTemplate('reset-password', { resetLink, userName }),
  });
};

export type SendOTPTypePayload = EmailTemplates['otp'] & {
  email: string;
};

export const sendOTPEmail = async (payload: SendOTPTypePayload) => {
  const { email, otpCode, userName } = payload;

  await mailer.sendMail({
    from: config.EMAIL_FROM,
    to: email,
    subject: 'Your One-Time Password (OTP)',
    html: renderTemplate('otp', { otpCode, userName }),
  });
};
