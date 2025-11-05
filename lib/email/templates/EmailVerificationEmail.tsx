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

interface EmailVerificationEmailProps {
  firstName?: string;
  email: string;
  verificationUrl: string;
}

export const EmailVerificationEmail = ({
  firstName,
  email,
  verificationUrl,
}: EmailVerificationEmailProps) => {
  const displayName = firstName || email.split('@')[0];

  return (
    <Html>
      <Head />
      <Preview>Vérifiez votre adresse email pour Big Vape</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={heading}>Big Vape</Heading>
          </Section>

          <Section style={content}>
            <Section style={emojiSection}>
              <Text style={emoji}>📧</Text>
            </Section>

            <Heading style={title}>Vérifiez votre adresse email</Heading>

            <Text style={paragraph}>Bonjour {displayName},</Text>

            <Text style={paragraph}>
              Merci de vous être inscrit sur Big Vape! Pour finaliser votre
              inscription, veuillez vérifier votre adresse email en cliquant sur
              le bouton ci-dessous.
            </Text>

            <Section style={buttonContainer}>
              <Button style={button} href={verificationUrl}>
                Vérifier mon email
              </Button>
            </Section>

            <Text style={paragraph}>
              Ou copiez et collez ce lien dans votre navigateur:
            </Text>

            <Text style={linkText}>{verificationUrl}</Text>

            <Text style={warningText}>
              Ce lien expirera dans 24 heures. Si vous n'avez pas demandé cette
              vérification, vous pouvez ignorer cet email en toute sécurité.
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

export default EmailVerificationEmail;

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

const linkText = {
  fontSize: '14px',
  color: '#737373',
  wordBreak: 'break-all' as const,
  margin: '16px 0',
};

const warningText = {
  fontSize: '14px',
  color: '#dc2626',
  backgroundColor: '#fef2f2',
  padding: '16px',
  borderRadius: '8px',
  margin: '24px 0',
  borderLeft: '4px solid #dc2626',
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
