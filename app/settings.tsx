import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import * as Notifications from 'expo-notifications';
import TrackerSettings from './components/TrackerSettings';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { TermsOfService } from './components/TermsOfService';
import { ConfirmDialog } from './components/ConfirmDialog';
import { EnergyEntry } from './types';

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
  entries?: EnergyEntry[];
  onClearHistory?: () => void;
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

const Settings: React.FC<SettingsProps> = ({ 
  theme, 
  colorScheme, 
  onThemeToggle,
  entries = [],
  onClearHistory = () => {} 
}) => {
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [morningReminderTime, setMorningReminderTime] = React.useState("9:00 AM");
  const [eveningReminderTime, setEveningReminderTime] = React.useState("9:00 PM");
  const [isTimePickerVisible, setIsTimePickerVisible] = useState(false);
  const [activeReminder, setActiveReminder] = useState<'morning' | 'evening' | null>(null);
  const [isPrivacyPolicyVisible, setIsPrivacyPolicyVisible] = useState(false);
  const [isTermsOfServiceVisible, setIsTermsOfServiceVisible] = useState(false);
  const [isClearHistoryVisible, setIsClearHistoryVisible] = useState(false);
  const [isExportDialogVisible, setIsExportDialogVisible] = useState(false);
  const appVersion = "1.0.0";  // This would normally come from your app config

  const scheduleNotification = async (time: string, identifier: string, title: string) => {
    try {
      // Parse the time string
      const [timeStr, period] = time.split(' ');
      const [hours, minutes] = timeStr.split(':');
      let hour = parseInt(hours);
      
      // Convert to 24-hour format
      if (period === 'PM' && hour !== 12) hour += 12;
      if (period === 'AM' && hour === 12) hour = 0;

      // Cancel any existing notification with this identifier
      await Notifications.cancelScheduledNotificationAsync(identifier);

      if (notificationsEnabled) {
        // Schedule notifications for the next 7 days
        const now = new Date();
        for (let i = 0; i < 7; i++) {
          const scheduledDate = new Date(now);
          scheduledDate.setDate(scheduledDate.getDate() + i);
          scheduledDate.setHours(hour, parseInt(minutes), 0, 0);
          
          // Only schedule if the time hasn't passed yet
          if (scheduledDate > now) {
            await Notifications.scheduleNotificationAsync({
              content: {
                title: "Time to check in!",
                body: title,
              },
              trigger: scheduledDate,
            });
          }
        }
        
        console.log(`Scheduled ${identifier} notifications for ${hour}:${minutes}`);
      }
    } catch (error) {
      console.error('Error scheduling notification:', error);
      Alert.alert(
        "Notification Error",
        "Failed to schedule notification. Please check your notification permissions."
      );
    }
  };

  // Schedule notifications when times change or notifications are toggled
  useEffect(() => {
    scheduleNotification(morningReminderTime, 'morning-reminder', 'Good morning! How are you feeling?');
    scheduleNotification(eveningReminderTime, 'evening-reminder', 'Time for your evening check-in!');
  }, [morningReminderTime, eveningReminderTime, notificationsEnabled]);

  const handleTimeConfirm = (date: Date) => {
    const formattedTime = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    if (activeReminder === 'morning') {
      setMorningReminderTime(formattedTime);
    } else if (activeReminder === 'evening') {
      setEveningReminderTime(formattedTime);
    }
    
    setIsTimePickerVisible(false);
    setActiveReminder(null);
  };

  const handleNotificationsToggle = async (value: boolean) => {
    if (value) {
      // Request permissions when enabling notifications
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          "Permission Required",
          "Please enable notifications in your device settings to receive reminders.",
          [{ text: "OK" }]
        );
        return;
      }
    }
    setNotificationsEnabled(value);
  };

  const showTimePicker = (type: 'morning' | 'evening') => {
    setActiveReminder(type);
    setIsTimePickerVisible(true);
  };

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
            label="Daily Reminders" 
            theme={theme}
            rightElement={
              <Switch 
                value={notificationsEnabled}
                onValueChange={handleNotificationsToggle}
                ios_backgroundColor={theme.surface}
              />
            }
          />
          {notificationsEnabled && (
            <>
              <SettingsRow 
                label="Morning Reminder"
                value={morningReminderTime}
                theme={theme}
                onPress={() => showTimePicker('morning')}
              />
              <SettingsRow 
                label="Evening Reminder"
                value={eveningReminderTime}
                theme={theme}
                onPress={() => showTimePicker('evening')}
              />
            </>
          )}
        </SettingsSection>

        <SettingsSection title="Data" theme={theme}>
          <SettingsRow 
            label="Export Data"
            value="CSV"
            theme={theme}
            onPress={() => setIsExportDialogVisible(true)}
          />
          <SettingsRow 
            label="Clear History"
            value={`${entries.length} entries`}
            theme={theme}
            onPress={() => setIsClearHistoryVisible(true)}
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

      <DateTimePickerModal
        isVisible={isTimePickerVisible}
        mode="time"
        onConfirm={handleTimeConfirm}
        onCancel={() => {
          setIsTimePickerVisible(false);
          setActiveReminder(null);
        }}
        display="spinner"
        isDarkModeEnabled={colorScheme === 'dark'}
        textColor={colorScheme === 'light' ? '#000000' : '#FFFFFF'}
        pickerContainerStyleIOS={{
          backgroundColor: colorScheme === 'light' ? '#FFFFFF' : '#1C1C1E',
          borderTopLeftRadius: 14,
          borderTopRightRadius: 14,
          paddingBottom: 16,
          marginHorizontal: 8,
        }}
        modalStyleIOS={{
          margin: 0,
          justifyContent: 'flex-end',
          paddingBottom: 10,
        }}
        backdropStyleIOS={{
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
        }}
        confirmTextIOS="Confirm"
        cancelTextIOS="Cancel"
        buttonTextColorIOS={colorScheme === 'light' ? '#007AFF' : '#0A84FF'}
        customCancelButtonIOS={() => (
          <TouchableOpacity
            onPress={() => {
              setIsTimePickerVisible(false);
              setActiveReminder(null);
            }}
            style={{
              backgroundColor: colorScheme === 'light' ? '#F2F2F7' : '#2C2C2E',
              marginHorizontal: 16,
              marginBottom: 8,
              padding: 12,
              borderRadius: 10,
              alignItems: 'center',
            }}
          >
            <Text style={{
              color: colorScheme === 'light' ? '#007AFF' : '#0A84FF',
              fontSize: 17,
              fontWeight: '600',
            }}>
              Cancel
            </Text>
          </TouchableOpacity>
        )}
      />

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
      <ConfirmDialog
        isVisible={isClearHistoryVisible}
        onClose={() => setIsClearHistoryVisible(false)}
        onConfirm={onClearHistory}
        title="Clear History"
        message="Are you sure you want to clear all your entries? This action cannot be undone."
        confirmText="Clear"
        cancelText="Cancel"
        theme={theme}
      />
      <ConfirmDialog
        isVisible={isExportDialogVisible}
        onClose={() => setIsExportDialogVisible(false)}
        onConfirm={() => setIsExportDialogVisible(false)}
        title="Coming Soon"
        message="The export feature is currently in development. Check back soon!"
        confirmText="Got it"
        showCancel={false}
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