import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY est manquante dans les variables d\'environnement');
}

if (!process.env.EMAIL_FROM) {
  throw new Error('EMAIL_FROM est manquante dans les variables d\'environnement');
}

// Créer une instance unique du client Resend
export const resend = new Resend(process.env.RESEND_API_KEY);

// Exporter les configurations email
export const emailConfig = {
  from: process.env.EMAIL_FROM,
  adminEmail: process.env.ADMIN_EMAIL || 'admin@big-vape.fr',
};
