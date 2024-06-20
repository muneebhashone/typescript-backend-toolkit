import ejs from 'ejs';
import fs from 'fs';
import path from 'node:path';

export type EmailTemplates = {
  tracking: {
    name: string;
    trackingNumber: string;
    carrier: string;
    status: string;
  };
  'set-password': {
    name: string;
    passwordSetLink: string;
  };
  'reset-password': {
    resetLink: string;
    userName: string;
  };
};

export const renderTemplate = <T extends keyof EmailTemplates>(
  template: T,
  payload: EmailTemplates[T],
): string => {
  const emailTemplatePath = path.join(
    process.cwd(),
    'templates',
    `${template}.ejs`,
  );
  const emailTemplate = fs.readFileSync(emailTemplatePath, 'utf-8');
  const compiledTemplate = ejs.compile(emailTemplate);
  return compiledTemplate(payload);
};
