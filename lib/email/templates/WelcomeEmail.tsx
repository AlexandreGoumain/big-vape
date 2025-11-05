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
} from '@react-email/components';
import * as React from 'react';

interface WelcomeEmailProps {
  firstName?: string;
  email: string;
}

export const WelcomeEmail = ({
  firstName,
  email,
}: WelcomeEmailProps) => {
  const displayName = firstName || email.split('@')[0];

  return (
    <Html>
      <Head />
      <Preview>Bienvenue sur Big Vape!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={heading}>Big Vape</Heading>
          </Section>

          <Section style={content}>
            <Heading style={title}>
              Bienvenue, {displayName}!
            </Heading>

            <Text style={paragraph}>
              Merci de vous être inscrit sur Big Vape. Nous sommes ravis de vous
              compter parmi nos clients!
            </Text>

            <Text style={paragraph}>
              Avec votre compte, vous pouvez:
            </Text>

            <Section style={list}>
              <Text style={listItem}>✓ Commander vos produits préférés</Text>
              <Text style={listItem}>✓ Suivre vos commandes en temps réel</Text>
              <Text style={listItem}>✓ Sauvegarder vos adresses de livraison</Text>
              <Text style={listItem}>✓ Accéder à des offres exclusives</Text>
            </Section>

            <Section style={buttonContainer}>
              <Button style={button} href={process.env.NEXTAUTH_URL || 'http://localhost:3000'}>
                Commencer vos achats
              </Button>
            </Section>

            <Text style={paragraph}>
              Si vous avez des questions, n'hésitez pas à nous contacter.
              Notre équipe est là pour vous aider!
            </Text>

            <Text style={paragraph}>
              À bientôt,
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

export default WelcomeEmail;

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

const title = {
  fontSize: '28px',
  fontWeight: 'bold',
  color: '#1a1a1a',
  marginBottom: '16px',
  textAlign: 'center' as const,
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#525252',
  marginBottom: '16px',
};

const list = {
  margin: '24px 0',
  padding: '0 20px',
};

const listItem = {
  fontSize: '16px',
  lineHeight: '32px',
  color: '#525252',
  margin: '8px 0',
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
