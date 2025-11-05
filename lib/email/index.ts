// Export all email services
export {
  sendOrderConfirmationEmail,
  sendWelcomeEmail,
  sendOrderStatusUpdateEmail,
  sendEmailVerification,
  sendAdminOrderNotification,
} from './services';

// Export client and config
export { resend, emailConfig } from './client';

// Export templates (for testing purposes)
export { OrderConfirmationEmail } from './templates/OrderConfirmationEmail';
export { WelcomeEmail } from './templates/WelcomeEmail';
export { OrderStatusUpdateEmail } from './templates/OrderStatusUpdateEmail';
export { EmailVerificationEmail } from './templates/EmailVerificationEmail';
