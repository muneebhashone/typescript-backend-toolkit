import formData from 'form-data';
import Mailgun from 'mailgun.js';
import nodemailer from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';
import config from '@/config/env';
import logger from '@/plugins/observability/logger';
import { EmailError } from './errors';

/**
 * Email parameters for sending emails
 */
export type EmailParams = {
  to: string;
  subject: string;
  html: string;
  from?: string;
};

/**
 * Email send result
 */
export type EmailResult = {
  id: string;
  message?: string;
};

/**
 * Abstract email provider interface
 */
export interface EmailProvider {
  send(params: EmailParams): Promise<EmailResult>;
  healthCheck(): Promise<boolean>;
}

/**
 * Mailgun email provider implementation
 */
export class MailgunProvider implements EmailProvider {
  private client: ReturnType<Mailgun['client']>;
  private domain: string;
  private fromEmail: string;

  constructor() {
    const mailgun = new Mailgun(formData);
    this.client = mailgun.client({
      username: 'api',
      key: config.MAILGUN_API_KEY,
    });
    this.domain = config.MAILGUN_DOMAIN;
    this.fromEmail = config.MAILGUN_FROM_EMAIL;
  }

  async send(params: EmailParams): Promise<EmailResult> {
    try {
      const messageData = {
        from: params.from || this.fromEmail,
        to: params.to,
        subject: params.subject,
        html: params.html,
      };

      const result = await this.client.messages.create(this.domain, messageData);

      logger.info({
        provider: 'mailgun',
        id: result.id,
        to: params.to,
        subject: params.subject,
      }, 'Email sent successfully');

      return {
        id: result.id || 'unknown',
        message: result.message || 'Email sent',
      };
    } catch (err) {
      logger.error({
        provider: 'mailgun',
        to: params.to,
        subject: params.subject,
        err,
      }, 'Failed to send email');

      throw new EmailError('Failed to send email via Mailgun', err);
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      // Mailgun doesn't have a ping endpoint, so we just check if credentials exist
      return !!(config.MAILGUN_API_KEY && config.MAILGUN_DOMAIN);
    } catch (err) {
      logger.error({ err }, 'Mailgun health check failed');
      return false;
    }
  }
}

/**
 * Nodemailer (SMTP) email provider implementation
 */
export class NodemailerProvider implements EmailProvider {
  private transporter: nodemailer.Transporter;
  private fromEmail: string;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.SMTP_HOST,
      port: config.SMTP_PORT,
      auth: {
        user: config.SMTP_USERNAME,
        pass: config.SMTP_PASSWORD,
      },
    } as SMTPTransport.Options);

    this.fromEmail = config.SMTP_FROM || config.EMAIL_FROM || 'noreply@example.com';
  }

  async send(params: EmailParams): Promise<EmailResult> {
    try {
      const result = await this.transporter.sendMail({
        from: params.from || this.fromEmail,
        to: params.to,
        subject: params.subject,
        html: params.html,
      });

      logger.info({
        provider: 'nodemailer',
        messageId: result.messageId,
        to: params.to,
        subject: params.subject,
      }, 'Email sent successfully');

      return {
        id: result.messageId,
        message: result.response,
      };
    } catch (err) {
      logger.error({
        provider: 'nodemailer',
        to: params.to,
        subject: params.subject,
        err,
      }, 'Failed to send email');

      throw new EmailError('Failed to send email via SMTP', err);
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (err) {
      logger.error({ err }, 'Nodemailer health check failed');
      return false;
    }
  }
}

/**
 * Factory function to create the appropriate email provider
 * Priority: Mailgun > SMTP
 */
const createEmailProvider = (): EmailProvider => {
  // Prefer Mailgun if configured
  if (config.MAILGUN_API_KEY && config.MAILGUN_DOMAIN) {
    logger.info('Using Mailgun email provider');
    return new MailgunProvider();
  }

  // Fallback to SMTP if configured
  if (config.SMTP_HOST && config.SMTP_PORT) {
    logger.info('Using Nodemailer (SMTP) email provider');
    return new NodemailerProvider();
  }

  throw new EmailError('No email provider configured. Please set either Mailgun or SMTP credentials.');
};

/**
 * Auto-initialized email provider singleton
 */
export const emailProvider = createEmailProvider();

/**
 * Convenience function to send emails using the configured provider
 */
export const sendEmail = async (params: EmailParams): Promise<EmailResult> => {
  return emailProvider.send(params);
};

/**
 * Health check function for email service
 * Returns a function compatible with HealthCheck interface
 */
export const checkEmailHealth = () => {
  return async (): Promise<boolean> => {
    try {
      return await emailProvider.healthCheck();
    } catch (err) {
      logger.error({ err }, 'Email health check failed');
      return false;
    }
  };
};
