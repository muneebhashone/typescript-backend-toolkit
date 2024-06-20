import { EmailTemplates, renderTemplate } from '../utils/email.utils';
import mailer from '../lib/email.server';
import config from '../config/config.service';

export type SendTrackingEmailPayload = EmailTemplates['tracking'] & {
  email: string;
};

export const sendTrackingEmail = async (payload: SendTrackingEmailPayload) => {
  const { carrier, email, name, status, trackingNumber } = payload;
  await mailer.sendMail({
    from: config.EMAIL_FROM,
    to: email,
    subject: `Shipping Status Update: ${trackingNumber}`,
    html: renderTemplate('tracking', { status, name, trackingNumber, carrier }),
  });
};

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
