import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notifications to show when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotificationsAsync() {
  let token;

  // Check if we're running on a physical device (not simulator/web)
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // Only ask if permissions have not already been determined
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  // If no permission, exit the function
  if (finalStatus !== 'granted') {
    return null;
  }

  // Get the token that uniquely identifies this device
  token = (await Notifications.getExpoPushTokenAsync()).data;

  // Required for Android
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return token;
}

export async function scheduleDailyNotifications() {
  // Cancel any existing notifications
  await Notifications.cancelAllScheduledNotificationsAsync();

  // Schedule for tomorrow at the same time
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Energy Check-in 🌟",
      body: "How are your energy levels right now?",
      data: { type: 'energy_check' },
    },
    trigger: tomorrow,
  });
}

export async function handleNotificationResponse(response: Notifications.NotificationResponse) {
  const data = response.notification.request.content.data;
  
  if (data.type === 'energy_check') {
    // TODO: Open app to energy input screen
    console.log('Energy check notification tapped');
  }
}

// Function to send an immediate test notification
export async function sendTestNotification() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Test Notification 👋",
      body: "This is a test notification from bloom!",
      data: { type: 'test' },
    },
    trigger: null, // null means send immediately
  });
} 