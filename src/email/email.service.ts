import { EmailTemplates, renderTemplate } from '../utils/email.utils';
import mailer from '../lib/email.server';
import config from '../config/config.service';

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
