import { render } from '@react-email/render';
import { resend, emailConfig } from './client';
import { OrderConfirmationEmail } from './templates/OrderConfirmationEmail';
import { WelcomeEmail } from './templates/WelcomeEmail';
import { OrderStatusUpdateEmail } from './templates/OrderStatusUpdateEmail';
import { EmailVerificationEmail } from './templates/EmailVerificationEmail';

// Types pour les données des emails
interface OrderData {
  orderNumber: number;
  customerName: string;
  customerEmail: string;
  orderDate: Date;
  orderItems: Array<{
    product: {
      title: string;
      image?: string | null;
    };
    quantity: number;
    price: number;
  }>;
  total: number;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod?: string | null;
}

interface UserData {
  firstName?: string | null;
  email: string;
}

interface OrderStatusData {
  orderNumber: number;
  customerName: string;
  customerEmail: string;
  status: string;
  previousStatus?: string;
}

interface EmailVerificationData {
  firstName?: string | null;
  email: string;
  verificationToken: string;
}

// Fonction pour envoyer l'email de confirmation de commande
export async function sendOrderConfirmationEmail(orderData: OrderData) {
  try {
    const emailHtml = render(OrderConfirmationEmail(orderData));

    const { data, error } = await resend.emails.send({
      from: emailConfig.from,
      to: orderData.customerEmail,
      subject: `Confirmation de commande #${orderData.orderNumber}`,
      html: emailHtml,
    });

    if (error) {
      console.error('Erreur lors de l\'envoi de l\'email de confirmation:', error);
      throw error;
    }

    console.log('Email de confirmation envoyé avec succès:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email de confirmation:', error);
    return { success: false, error };
  }
}

// Fonction pour envoyer l'email de bienvenue
export async function sendWelcomeEmail(userData: UserData) {
  try {
    const emailHtml = render(
      WelcomeEmail({
        firstName: userData.firstName || undefined,
        email: userData.email,
      })
    );

    const { data, error } = await resend.emails.send({
      from: emailConfig.from,
      to: userData.email,
      subject: 'Bienvenue sur Big Vape!',
      html: emailHtml,
    });

    if (error) {
      console.error('Erreur lors de l\'envoi de l\'email de bienvenue:', error);
      throw error;
    }

    console.log('Email de bienvenue envoyé avec succès:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email de bienvenue:', error);
    return { success: false, error };
  }
}

// Fonction pour envoyer l'email de mise à jour de statut de commande
export async function sendOrderStatusUpdateEmail(statusData: OrderStatusData) {
  try {
    const emailHtml = render(OrderStatusUpdateEmail(statusData));

    const statusTitles: Record<string, string> = {
      processing: 'en cours de traitement',
      shipped: 'expédiée',
      delivered: 'livrée',
      cancelled: 'annulée',
    };

    const statusTitle = statusTitles[statusData.status] || statusData.status;

    const { data, error } = await resend.emails.send({
      from: emailConfig.from,
      to: statusData.customerEmail,
      subject: `Votre commande #${statusData.orderNumber} est ${statusTitle}`,
      html: emailHtml,
    });

    if (error) {
      console.error('Erreur lors de l\'envoi de l\'email de mise à jour:', error);
      throw error;
    }

    console.log('Email de mise à jour envoyé avec succès:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email de mise à jour:', error);
    return { success: false, error };
  }
}

// Fonction pour envoyer l'email de vérification
export async function sendEmailVerification(verificationData: EmailVerificationData) {
  try {
    const verificationUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/verify-email?token=${verificationData.verificationToken}`;

    const emailHtml = render(
      EmailVerificationEmail({
        firstName: verificationData.firstName || undefined,
        email: verificationData.email,
        verificationUrl,
      })
    );

    const { data, error } = await resend.emails.send({
      from: emailConfig.from,
      to: verificationData.email,
      subject: 'Vérifiez votre adresse email - Big Vape',
      html: emailHtml,
    });

    if (error) {
      console.error('Erreur lors de l\'envoi de l\'email de vérification:', error);
      throw error;
    }

    console.log('Email de vérification envoyé avec succès:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email de vérification:', error);
    return { success: false, error };
  }
}

// Fonction pour envoyer une notification à l'admin lors d'une nouvelle commande
export async function sendAdminOrderNotification(orderData: OrderData) {
  try {
    const emailHtml = `
      <h2>Nouvelle commande reçue!</h2>
      <p><strong>Numéro de commande:</strong> #${orderData.orderNumber}</p>
      <p><strong>Client:</strong> ${orderData.customerName} (${orderData.customerEmail})</p>
      <p><strong>Total:</strong> ${(orderData.total / 100).toFixed(2)}€</p>
      <p><strong>Date:</strong> ${orderData.orderDate.toLocaleString('fr-FR')}</p>
      <h3>Articles:</h3>
      <ul>
        ${orderData.orderItems
          .map(
            (item) =>
              `<li>${item.product.title} - Quantité: ${item.quantity} - ${(
                (item.price * item.quantity) /
                100
              ).toFixed(2)}€</li>`
          )
          .join('')}
      </ul>
      <h3>Adresse de livraison:</h3>
      <p>
        ${orderData.shippingAddress.street}<br/>
        ${orderData.shippingAddress.zipCode} ${orderData.shippingAddress.city}<br/>
        ${orderData.shippingAddress.state}, ${orderData.shippingAddress.country}
      </p>
    `;

    const { data, error } = await resend.emails.send({
      from: emailConfig.from,
      to: emailConfig.adminEmail,
      subject: `Nouvelle commande #${orderData.orderNumber}`,
      html: emailHtml,
    });

    if (error) {
      console.error('Erreur lors de l\'envoi de la notification admin:', error);
      throw error;
    }

    console.log('Notification admin envoyée avec succès:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la notification admin:', error);
    return { success: false, error };
  }
}
