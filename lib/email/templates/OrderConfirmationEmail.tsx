import {
  Body,
  Container,
  Column,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
  Hr,
} from '@react-email/components';
import * as React from 'react';

interface OrderItem {
  product: {
    title: string;
    image?: string | null;
  };
  quantity: number;
  price: number;
}

interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface OrderConfirmationEmailProps {
  orderNumber: number;
  customerName: string;
  orderDate: Date;
  orderItems: OrderItem[];
  total: number;
  shippingAddress: Address;
  paymentMethod?: string | null;
}

export const OrderConfirmationEmail = ({
  orderNumber = 12345,
  customerName = 'John Doe',
  orderDate = new Date(),
  orderItems = [],
  total = 0,
  shippingAddress = {
    street: '123 rue de la Paix',
    city: 'Paris',
    state: 'Île-de-France',
    zipCode: '75001',
    country: 'France',
  },
  paymentMethod = 'Carte bancaire',
}: OrderConfirmationEmailProps) => {
  const formattedDate = new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(orderDate);

  const formatPrice = (priceInCents: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(priceInCents / 100);
  };

  return (
    <Html>
      <Head />
      <Preview>Confirmation de votre commande #{orderNumber}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={heading}>Big Vape</Heading>
          </Section>

          <Section style={content}>
            <Heading style={title}>
              Merci pour votre commande, {customerName}!
            </Heading>
            <Text style={paragraph}>
              Votre commande a été confirmée et sera traitée dans les plus
              brefs délais.
            </Text>

            <Section style={orderInfo}>
              <Row>
                <Column>
                  <Text style={label}>Numéro de commande</Text>
                  <Text style={value}>#{orderNumber}</Text>
                </Column>
                <Column>
                  <Text style={label}>Date</Text>
                  <Text style={value}>{formattedDate}</Text>
                </Column>
              </Row>
            </Section>

            <Hr style={divider} />

            <Heading as="h2" style={sectionTitle}>
              Articles commandés
            </Heading>

            {orderItems.map((item, index) => (
              <Section key={index} style={productRow}>
                <Row>
                  <Column style={productImageColumn}>
                    {item.product.image && (
                      <Img
                        src={item.product.image}
                        alt={item.product.title}
                        width="80"
                        height="80"
                        style={productImage}
                      />
                    )}
                  </Column>
                  <Column style={productInfoColumn}>
                    <Text style={productTitle}>{item.product.title}</Text>
                    <Text style={productQuantity}>
                      Quantité: {item.quantity}
                    </Text>
                  </Column>
                  <Column style={productPriceColumn}>
                    <Text style={productPrice}>
                      {formatPrice(item.price * item.quantity)}
                    </Text>
                  </Column>
                </Row>
              </Section>
            ))}

            <Hr style={divider} />

            <Section style={totalSection}>
              <Row>
                <Column align="right">
                  <Text style={totalLabel}>Total:</Text>
                </Column>
                <Column align="right" style={totalPriceColumn}>
                  <Text style={totalPrice}>{formatPrice(total)}</Text>
                </Column>
              </Row>
            </Section>

            <Hr style={divider} />

            <Heading as="h2" style={sectionTitle}>
              Adresse de livraison
            </Heading>
            <Text style={paragraph}>
              {shippingAddress.street}
              <br />
              {shippingAddress.zipCode} {shippingAddress.city}
              <br />
              {shippingAddress.state}, {shippingAddress.country}
            </Text>

            {paymentMethod && (
              <>
                <Heading as="h2" style={sectionTitle}>
                  Méthode de paiement
                </Heading>
                <Text style={paragraph}>{paymentMethod}</Text>
              </>
            )}

            <Hr style={divider} />

            <Text style={paragraph}>
              Vous recevrez un email de notification dès que votre commande sera
              expédiée.
            </Text>

            <Text style={paragraph}>
              Si vous avez des questions concernant votre commande, n'hésitez
              pas à nous contacter.
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

export default OrderConfirmationEmail;

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
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#1a1a1a',
  marginBottom: '16px',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#525252',
};

const orderInfo = {
  margin: '32px 0',
  padding: '24px',
  backgroundColor: '#f6f9fc',
  borderRadius: '8px',
};

const label = {
  fontSize: '12px',
  color: '#737373',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
  margin: '0 0 4px',
};

const value = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#1a1a1a',
  margin: '0',
};

const divider = {
  borderColor: '#e5e5e5',
  margin: '32px 0',
};

const sectionTitle = {
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#1a1a1a',
  margin: '24px 0 16px',
};

const productRow = {
  margin: '16px 0',
};

const productImageColumn = {
  width: '80px',
  paddingRight: '16px',
};

const productImage = {
  borderRadius: '8px',
  objectFit: 'cover' as const,
};

const productInfoColumn = {
  verticalAlign: 'top' as const,
};

const productTitle = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#1a1a1a',
  margin: '0 0 4px',
};

const productQuantity = {
  fontSize: '14px',
  color: '#737373',
  margin: '0',
};

const productPriceColumn = {
  verticalAlign: 'top' as const,
  textAlign: 'right' as const,
  width: '100px',
};

const productPrice = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#1a1a1a',
  margin: '0',
};

const totalSection = {
  margin: '24px 0',
};

const totalLabel = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#1a1a1a',
  margin: '0',
  paddingRight: '16px',
};

const totalPriceColumn = {
  width: '150px',
};

const totalPrice = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#1a1a1a',
  margin: '0',
};

const footer = {
  padding: '32px 40px',
  textAlign: 'center' as const,
};

const footerText = {
  fontSize: '12px',
  color: '#737373',
  lineHeight: '20px',
};

const footerLink = {
  color: '#737373',
  textDecoration: 'underline',
};
