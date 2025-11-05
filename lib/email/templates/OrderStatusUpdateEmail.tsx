import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Hr,
} from '@react-email/components';
import * as React from 'react';

interface OrderStatusUpdateEmailProps {
  orderNumber: number;
  customerName: string;
  status: string;
  previousStatus?: string;
}

const statusMessages: Record<
  string,
  { title: string; message: string; emoji: string }
> = {
  processing: {
    title: 'Votre commande est en cours de traitement',
    message:
      'Nous avons reçu votre commande et nous la préparons actuellement. Vous recevrez un email dès qu\'elle sera expédiée.',
    emoji: '📦',
  },
  shipped: {
    title: 'Votre commande a été expédiée',
    message:
      'Bonne nouvelle! Votre commande est en route. Vous devriez la recevoir dans les prochains jours.',
    emoji: '🚚',
  },
  delivered: {
    title: 'Votre commande a été livrée',
    message:
      'Votre commande a été livrée avec succès. Nous espérons que vous apprécierez vos produits!',
    emoji: '✅',
  },
  cancelled: {
    title: 'Votre commande a été annulée',
    message:
      'Votre commande a été annulée. Si vous avez des questions, n\'hésitez pas à nous contacter.',
    emoji: '❌',
  },
};

export const OrderStatusUpdateEmail = ({
  orderNumber = 12345,
  customerName = 'John Doe',
  status = 'processing',
  previousStatus,
}: OrderStatusUpdateEmailProps) => {
  const statusInfo =
    statusMessages[status] || statusMessages.processing;

  return (
    <Html>
      <Head />
      <Preview>
        Mise à jour de votre commande #{orderNumber} - {statusInfo.title}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={heading}>Big Vape</Heading>
          </Section>

          <Section style={content}>
            <Section style={emojiSection}>
              <Text style={emoji}>{statusInfo.emoji}</Text>
            </Section>

            <Heading style={title}>{statusInfo.title}</Heading>

            <Text style={paragraph}>Bonjour {customerName},</Text>

            <Text style={paragraph}>{statusInfo.message}</Text>

            <Section style={orderInfo}>
              <Text style={orderLabel}>Numéro de commande</Text>
              <Text style={orderValue}>#{orderNumber}</Text>
              <Hr style={divider} />
              <Text style={orderLabel}>Statut actuel</Text>
              <Text style={orderValue}>
                {status === 'processing' && 'En cours de traitement'}
                {status === 'shipped' && 'Expédiée'}
                {status === 'delivered' && 'Livrée'}
                {status === 'cancelled' && 'Annulée'}
                {status === 'pending' && 'En attente'}
              </Text>
            </Section>

            <Section style={buttonContainer}>
              <Button
                style={button}
                href={`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/orders`}
              >
                Voir ma commande
              </Button>
            </Section>

            {status === 'delivered' && (
              <Text style={paragraph}>
                Nous espérons que vous êtes satisfait de votre achat. N'hésitez
                pas à laisser un avis sur nos produits!
              </Text>
            )}

            <Text style={paragraph}>
              Si vous avez des questions concernant votre commande, n'hésitez
              pas à nous contacter.
            </Text>

            <Text style={paragraph}>
              Cordialement,
              <br />
              L'équipe Big Vape
            </Text>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              © 2024 Big Vape. Tous droits réservés.
            </Text>
            <Text style={footerText}>
              <Link href="#" style={footerLink}>
                Politique de confidentialité
              </Link>
              {' • '}
              <Link href="#" style={footerLink}>
                Conditions d'utilisation
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default OrderStatusUpdateEmail;

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const header = {
  padding: '32px 20px',
  backgroundColor: '#1a1a1a',
  textAlign: 'center' as const,
};

const heading = {
  fontSize: '32px',
  fontWeight: 'bold',
  color: '#ffffff',
  margin: '0',
  letterSpacing: '1px',
};

const content = {
  padding: '0 40px',
};

const emojiSection = {
  textAlign: 'center' as const,
  margin: '32px 0 16px',
};

const emoji = {
  fontSize: '64px',
  lineHeight: '64px',
  margin: '0',
};

const title = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#1a1a1a',
  marginBottom: '24px',
  textAlign: 'center' as const,
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#525252',
  marginBottom: '16px',
};

const orderInfo = {
  margin: '32px 0',
  padding: '24px',
  backgroundColor: '#f6f9fc',
  borderRadius: '8px',
  textAlign: 'center' as const,
};

const orderLabel = {
  fontSize: '12px',
  color: '#737373',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
  margin: '0 0 4px',
};

const orderValue = {
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#1a1a1a',
  margin: '0 0 16px',
};

const divider = {
  borderColor: '#e5e5e5',
  margin: '16px 0',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#1a1a1a',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '16px 32px',
};

const footer = {
  padding: '32px 40px',
  textAlign: 'center' as const,
};

const footerText = {
  fontSize: '12px',
  color: '#737373',
  lineHeight: '20px',
  marginBottom: '8px',
};

const footerLink = {
  color: '#737373',
  textDecoration: 'underline',
};
