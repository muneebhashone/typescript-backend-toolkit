import config from '../config/config.service';
import mailer from '../lib/email.server';
import { WithEmail } from '../types';
import {
  DropboxResetPasswordEmailProps,
  renderDropboxResetPasswordEmail,
} from './passwordReset';

export type SendResetPasswordTypePayload =
  WithEmail<DropboxResetPasswordEmailProps>;

export const sendResetPasswordEmail = async (
  payload: SendResetPasswordTypePayload,
) => {
  const { email, resetPasswordLink, userFirstname } = payload;

  await mailer.sendMail({
    from: config.EMAIL_FROM,
    to: email,
    subject: 'Reset Your Password',
    html: renderDropboxResetPasswordEmail({
      resetPasswordLink: resetPasswordLink,
      userFirstname: userFirstname,
    }),
  });
};
