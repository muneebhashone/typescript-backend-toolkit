# Email Service Documentation

This document outlines the email service implementation using React Email for templating and Mailgun for delivery.

## Overview

The email service provides a robust, type-safe way to send transactional emails using:
- [React Email](https://react.email/) for building and maintaining email templates
- [Mailgun](https://www.mailgun.com/) for reliable email delivery
- TypeScript for type safety and better developer experience

## Configuration

### Environment Variables

Add the following variables to your `.env` file:

```env
MAILGUN_API_KEY="your-mailgun-api-key"
MAILGUN_DOMAIN="your-mailgun-domain"
MAILGUN_FROM_EMAIL="noreply@yourdomain.com"
```

## Email Templates

Email templates are built using React Email components and are located in `src/email/templates/`. Each template is a React component that accepts typed props for the dynamic content.

### Available Templates

1. **Reset Password Email** (`ResetPassword.tsx`)
   ```typescript
   interface ResetPasswordEmailProps {
     userName: string;
     resetLink: string;
   }
   ```

## Usage

### Sending Reset Password Email

```typescript
import { sendResetPasswordEmail } from '../email/email.service';

await sendResetPasswordEmail({
  email: 'user@example.com',
  userName: 'John Doe',
  resetLink: 'https://yourdomain.com/reset-password?token=xyz'
});
```

### Creating New Email Templates

1. Create a new template in `src/email/templates/`
2. Use React Email components for consistent styling
3. Export the template component with proper TypeScript interfaces
4. Add a new method in `EmailService` class to send the email

Example:
```typescript
// src/email/templates/WelcomeEmail.tsx
import * as React from 'react';
import { Button, Container, Head, Html, Preview, Text } from '@react-email/components';

interface WelcomeEmailProps {
  userName: string;
}

export const WelcomeEmail = ({ userName }: WelcomeEmailProps) => (
  <Html>
    <Head />
    <Preview>Welcome to our platform</Preview>
    <Container>
      <Text>Welcome {userName}!</Text>
      <Button href="https://yourdomain.com/getting-started">
        Get Started
      </Button>
    </Container>
  </Html>
);

export default WelcomeEmail;
```

## Error Handling

The email service includes comprehensive error handling:

- Custom `EmailError` class for email-specific errors
- Detailed error logging using the application logger
- Type-safe error propagation

## Benefits

1. **Type Safety**: Full TypeScript support for templates and service methods
2. **Maintainable Templates**: React components for building and maintaining email templates
3. **Reliable Delivery**: Mailgun integration for professional email delivery
4. **Error Handling**: Comprehensive error handling and logging
5. **Developer Experience**: Easy to create and modify email templates using React

## Migration from Nodemailer

The service maintains backward compatibility with the previous Nodemailer implementation through exported functions. The internal implementation has been updated to use React Email and Mailgun while keeping the same interface.

## Testing Emails

To test emails in development:

1. Set up a Mailgun sandbox domain (free)
2. Use the sandbox domain and API key in your `.env.development`
3. Add verified recipient emails in Mailgun sandbox settings
4. Use these verified emails for testing

## Best Practices

1. Always use TypeScript interfaces for template props
2. Include proper error handling in your email sending logic
3. Use React Email components for consistent styling
4. Test emails with different email clients
5. Keep templates simple and mobile-responsive
