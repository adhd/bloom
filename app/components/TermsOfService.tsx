import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Sheet } from './ui/sheet';

interface TermsOfServiceProps {
  isVisible: boolean;
  onClose: () => void;
  theme: {
    background: string;
    text: string;
    textSecondary: string;
    surface: string;
  };
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
  theme: TermsOfServiceProps['theme'];
}

const Section: React.FC<SectionProps> = ({ title, children, theme }) => (
  <View style={styles.section}>
    <Text style={[styles.sectionTitle, { color: theme.text }]}>{title}</Text>
    {children}
  </View>
);

const BulletPoint: React.FC<{ text: string; theme: TermsOfServiceProps['theme'] }> = ({ text, theme }) => (
  <View style={styles.bulletPoint}>
    <Text style={[styles.bullet, { color: theme.textSecondary }]}>•</Text>
    <Text style={[styles.bulletText, { color: theme.textSecondary }]}>{text}</Text>
  </View>
);

export const TermsOfService: React.FC<TermsOfServiceProps> = ({ isVisible, onClose, theme }) => {
  return (
    <Sheet
      isVisible={isVisible}
      onClose={onClose}
      snapPoints={['90%']}
      backgroundStyle={{ backgroundColor: theme.background }}
    >
      <ScrollView style={styles.container}>
        <Text style={[styles.title, { color: theme.text }]}>Terms of Service for Bloom</Text>
        <Text style={[styles.date, { color: theme.textSecondary }]}>Last Updated: Jan 26, 2025</Text>
        
        <Text style={[styles.description, { color: theme.textSecondary }]}>
          By downloading or using this app, you agree to these terms. Please read them carefully.
        </Text>

        <Section title="Acceptance of Terms" theme={theme}>
          <Text style={[styles.text, { color: theme.textSecondary }]}>
            By accessing or using our app, you agree to be bound by these terms of service. If you disagree with any part of these terms, you do not have permission to use the app.
          </Text>
        </Section>

        <Section title="Account Terms" theme={theme}>
          <BulletPoint theme={theme} text="You are responsible for maintaining the security of your account" />
          <BulletPoint theme={theme} text="You are responsible for all activity that occurs under your account" />
          <BulletPoint theme={theme} text="You must provide accurate and complete information when creating an account" />
          <BulletPoint theme={theme} text="You may not use the app for any illegal or unauthorized purpose" />
        </Section>

        <Section title="App Usage" theme={theme}>
          <BulletPoint theme={theme} text="We grant you a limited, non-exclusive, non-transferable license to use the app" />
          <BulletPoint theme={theme} text="You may not copy, modify, distribute, sell, or lease any part of our app" />
          <BulletPoint theme={theme} text="You may not reverse engineer or attempt to extract the source code of the app" />
          <BulletPoint theme={theme} text="We reserve the right to terminate or suspend access to our app at any time" />
        </Section>

        <Section title="Data and Privacy" theme={theme}>
          <BulletPoint theme={theme} text="Your use of the app is also governed by our privacy policy" />
          <BulletPoint theme={theme} text="You own the data you provide to the app" />
          <BulletPoint theme={theme} text="You grant us license to use this data to provide and improve our services" />
          <BulletPoint theme={theme} text="We may anonymize and aggregate data for analysis purposes" />
        </Section>

        <Section title="Subscription Terms (if applicable)" theme={theme}>
          <BulletPoint theme={theme} text="Subscription fees are charged at the beginning of each billing period" />
          <BulletPoint theme={theme} text="Subscriptions automatically renew unless cancelled" />
          <BulletPoint theme={theme} text="Refunds are provided in accordance with the platform's (iOS/Android) policies" />
          <BulletPoint theme={theme} text="Prices may change with notice before the next billing period" />
        </Section>

        <Section title="Changes to Terms" theme={theme}>
          <Text style={[styles.text, { color: theme.textSecondary }]}>
            We reserve the right to modify these terms at any time. We will notify you of any changes through the app.
          </Text>
        </Section>

        <Section title="Limitation of Liability" theme={theme}>
          <Text style={[styles.text, { color: theme.textSecondary }]}>
            The app is provided "as is" without warranties of any kind. We are not liable for any damages arising from your use of the app.
          </Text>
        </Section>

        <Section title="Termination" theme={theme}>
          <Text style={[styles.text, { color: theme.textSecondary }]}>
            We may terminate or suspend your account at any time for violations of these terms.
          </Text>
        </Section>

        <Section title="Governing Law" theme={theme}>
          <Text style={[styles.text, { color: theme.textSecondary }]}>
            These terms are governed by the laws of planet Earth.
          </Text>
        </Section>

        <Section title="Contact" theme={theme}>
          <Text style={[styles.text, { color: theme.textSecondary }]}>
            Questions about these terms? Contact us at howdy@bloomapp.xyz
          </Text>
        </Section>
      </ScrollView>
    </Sheet>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  date: {
    fontSize: 15,
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingLeft: 4,
  },
  bullet: {
    fontSize: 16,
    marginRight: 8,
  },
  bulletText: {
    fontSize: 16,
    lineHeight: 24,
    flex: 1,
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
  },
}); 