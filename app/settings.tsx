import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import TrackerSettings from './components/TrackerSettings';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { TermsOfService } from './components/TermsOfService';

interface SettingsProps {
  theme: {
    background: string;
    text: string;
    textSecondary: string;
    surface: string;
    surfacePressed: string;
    border: string;
  };
  colorScheme: 'light' | 'dark';
  onThemeToggle: () => void;
}

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
  theme: SettingsProps['theme'];
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ title, children, theme }) => (
  <View style={styles.section}>
    <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>{title}</Text>
    <View style={[styles.sectionContent, { backgroundColor: theme.surface }]}>
      {children}
    </View>
  </View>
);

interface SettingsRowProps {
  label: string;
  theme: SettingsProps['theme'];
  value?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
}

const SettingsRow: React.FC<SettingsRowProps> = ({ label, value, theme, onPress, rightElement }) => (
  <TouchableOpacity 
    style={styles.row}
    onPress={onPress}
    disabled={!onPress}
  >
    <Text style={[styles.rowLabel, { color: theme.text }]}>{label}</Text>
    {rightElement ? rightElement : (
      <Text style={[styles.rowValue, { color: theme.textSecondary }]}>{value}</Text>
    )}
  </TouchableOpacity>
);

const Settings: React.FC<SettingsProps> = ({ theme, colorScheme, onThemeToggle }) => {
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [reminderTime, setReminderTime] = React.useState("9:00 PM");
  const [isPrivacyPolicyVisible, setIsPrivacyPolicyVisible] = useState(false);
  const [isTermsOfServiceVisible, setIsTermsOfServiceVisible] = useState(false);
  const appVersion = "1.0.0";  // This would normally come from your app config

  return (
    <>
      <ScrollView 
        style={[styles.container, { backgroundColor: theme.background }]}
        contentContainerStyle={styles.contentContainer}
      >
        <SettingsSection title="Appearance" theme={theme}>
          <SettingsRow 
            label="Dark Mode" 
            theme={theme}
            rightElement={
              <Switch 
                value={colorScheme === 'dark'}
                onValueChange={onThemeToggle}
                ios_backgroundColor={theme.surface}
              />
            }
          />
        </SettingsSection>

        <SettingsSection title="Trackers" theme={theme}>
          <TrackerSettings theme={theme} />
        </SettingsSection>

        <SettingsSection title="Notifications" theme={theme}>
          <SettingsRow 
            label="Daily Reminder" 
            theme={theme}
            rightElement={
              <Switch 
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                ios_backgroundColor={theme.surface}
              />
            }
          />
          <SettingsRow 
            label="Reminder Time"
            value={reminderTime}
            theme={theme}
            onPress={() => {/* Time picker would go here */}}
          />
        </SettingsSection>

        <SettingsSection title="Data" theme={theme}>
          <SettingsRow 
            label="Export Data"
            value="CSV"
            theme={theme}
            onPress={() => {/* Export functionality would go here */}}
          />
          <SettingsRow 
            label="Clear History"
            value="0 entries"
            theme={theme}
            onPress={() => {/* Clear data functionality would go here */}}
          />
        </SettingsSection>

        <SettingsSection title="About" theme={theme}>
          <SettingsRow 
            label="Version"
            value={appVersion}
            theme={theme}
          />
          <SettingsRow 
            label="Privacy Policy"
            theme={theme}
            onPress={() => setIsPrivacyPolicyVisible(true)}
          />
          <SettingsRow 
            label="Terms of Service"
            theme={theme}
            onPress={() => setIsTermsOfServiceVisible(true)}
          />
        </SettingsSection>
      </ScrollView>

      <PrivacyPolicy
        isVisible={isPrivacyPolicyVisible}
        onClose={() => setIsPrivacyPolicyVisible(false)}
        theme={theme}
      />
      <TermsOfService
        isVisible={isTermsOfServiceVisible}
        onClose={() => setIsTermsOfServiceVisible(false)}
        theme={theme}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 12,
  },
  sectionContent: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  rowLabel: {
    fontSize: 17,
    fontWeight: '400',
  },
  rowValue: {
    fontSize: 17,
  },
});

export default Settings; 