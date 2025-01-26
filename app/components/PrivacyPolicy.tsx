import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Sheet } from './ui/sheet';

interface PrivacyPolicyProps {
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
  theme: PrivacyPolicyProps['theme'];
}

const Section: React.FC<SectionProps> = ({ title, children, theme }) => (
  <View style={styles.section}>
    <Text style={[styles.sectionTitle, { color: theme.text }]}>{title}</Text>
    {children}
  </View>
);

const BulletPoint: React.FC<{ text: string; theme: PrivacyPolicyProps['theme'] }> = ({ text, theme }) => (
  <View style={styles.bulletPoint}>
    <Text style={[styles.bullet, { color: theme.textSecondary }]}>•</Text>
    <Text style={[styles.bulletText, { color: theme.textSecondary }]}>{text}</Text>
  </View>
);

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ isVisible, onClose, theme }) => {
  return (
    <Sheet
      isVisible={isVisible}
      onClose={onClose}
      snapPoints={['90%']}
      backgroundStyle={{ backgroundColor: theme.background }}
    >
      <ScrollView style={styles.container}>
        <Text style={[styles.title, { color: theme.text }]}>Privacy Policy for Bloom</Text>
        <Text style={[styles.date, { color: theme.textSecondary }]}>Last Updated: Jan 26, 2025</Text>
        
        <Text style={[styles.description, { color: theme.textSecondary }]}>
          This privacy policy describes how we collect, use, and handle your information when you use our app.
        </Text>

        <Section title="Information We Collect" theme={theme}>
          <BulletPoint theme={theme} text="Energy levels and mood data you input" />
          <BulletPoint theme={theme} text="App usage patterns and preferences" />
          <BulletPoint theme={theme} text="Calendar data (if you choose to connect Google Calendar)" />
          <BulletPoint theme={theme} text="Device information (operating system, app version)" />
        </Section>

        <Section title="How We Use Your Information" theme={theme}>
          <BulletPoint theme={theme} text="To provide and improve the app's core functionality" />
          <BulletPoint theme={theme} text="To generate insights about your energy and productivity patterns" />
          <BulletPoint theme={theme} text="To sync your data across devices" />
          <BulletPoint theme={theme} text="To troubleshoot technical issues" />
        </Section>

        <Section title="Data Storage and Security" theme={theme}>
          <BulletPoint theme={theme} text="Your data is stored securely in the cloud" />
          <BulletPoint theme={theme} text="We use industry-standard security measures to protect your information" />
          <BulletPoint theme={theme} text="We do not sell your personal data to third parties" />
          <BulletPoint theme={theme} text="You can delete your account and data at any time" />
        </Section>

        <Section title="Google Calendar Integration" theme={theme}>
          <BulletPoint theme={theme} text="Calendar access is optional and requires explicit permission" />
          <BulletPoint theme={theme} text="We only read calendar event data to generate insights" />
          <BulletPoint theme={theme} text="We never modify or create calendar events" />
          <BulletPoint theme={theme} text="You can revoke calendar access at any time" />
        </Section>

        <Section title="Third-Party Services" theme={theme}>
          <BulletPoint theme={theme} text="We use Firebase for data storage and authentication" />
          <BulletPoint theme={theme} text="Analytics tools may collect anonymous usage data" />
          <BulletPoint theme={theme} text="Third-party services have their own privacy policies" />
        </Section>

        <Section title="Updates to Privacy Policy" theme={theme}>
          <Text style={[styles.text, { color: theme.textSecondary }]}>
            We may update this privacy policy from time to time. We will notify you of any changes through the app.
          </Text>
        </Section>

        <Section title="Contact" theme={theme}>
          <Text style={[styles.text, { color: theme.textSecondary }]}>
            Questions about privacy? Contact us at howdy@bloomapp.xyz
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