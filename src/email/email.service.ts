import { render } from '@react-email/render';
import logger from '@/plugins/observability/logger';
import { emailProvider } from '../lib/email';
import { EmailError } from '../lib/errors';
import ResetPasswordEmail from './templates/ResetPassword';

export type SendResetPasswordTypePayload = {
  email: string;
  resetLink: string;
  userName: string;
};

// Utility functions for sending emails
export const sendEmail = async ({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) => {
  try {
    const result = await emailProvider.send({
      to,
      subject,
      html,
    });

    logger.info({
      msg: 'Email sent successfully',
      id: result.id,
      to,
      subject,
    });

    return result;
  } catch (error) {
    logger.error({
      msg: 'Failed to send email',
      error,
      to,
      subject,
    });

    throw new EmailError('Failed to send email', error);
  }
};

export const sendResetPasswordEmail = async (
  payload: SendResetPasswordTypePayload,
) => {
  const { email, resetLink, userName } = payload;

  try {
    // Render the React email template to HTML
    const emailHtml = await render(
      ResetPasswordEmail({
        resetLink,
        userName,
      }),
    );

    // Send the email with the rendered HTML
    await sendEmail({
      to: email,
      subject: 'Reset Your Password',
      html: emailHtml,
    });
  } catch (error) {
    logger.error({
      msg: 'Failed to send reset password email',
      error,
      email,
    });

    throw new EmailError('Failed to send reset password email', error);
  }
};
