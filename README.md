# bloom

Energy tracking app built with React Native + Expo. Helps users identify their peak energy patterns through simple daily logging.

## Prerequisites

- Node.js 18+ (`nvm use 18`)
- Expo CLI (`npm i -g expo-cli`)
- iOS Simulator (Xcode 14+) or Android Studio
- Firebase account with Firestore enabled

## Setup

```bash
# Install dependencies
npm install

# Configure Firebase
# 1. Create project at console.firebase.google.com
# 2. Add Web App (not iOS/Android) to get config
# 3. Enable Firestore Database
# 4. Copy .env.example to .env and add Firebase config values

# Verify setup
npm run start # Should show QR code and build without errors
```

## Development

```bash
npm run ios     # iOS Simulator
npm run android # Android Emulator
npm run web     # Web browser (limited features)
```

## Core Tech

- React Native + Expo (SDK 52)
- Firebase/Firestore
- TypeScript
- expo-notifications for reminders
- expo-router for navigation

## Development Setup

### Prerequisites

- Node 18+
- Xcode 14+ (iOS)
- Android Studio (Android)
- Firebase project with Firestore enabled

### Firebase Setup

1. Create project at [Firebase Console](https://console.firebase.google.com)
2. Enable Firestore
3. Add web app to get config
4. Set Firestore rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;  // TODO: Add proper auth rules
    }
  }
}
```

### Environment Config

Required variables in `.env`:

```
FIREBASE_API_KEY=
FIREBASE_AUTH_DOMAIN=
FIREBASE_PROJECT_ID=
FIREBASE_STORAGE_BUCKET=
FIREBASE_MESSAGING_SENDER_ID=
FIREBASE_APP_ID=
FIREBASE_MEASUREMENT_ID=
```

## Key Files

```
app/
├── index.tsx     # Main app + UI components
├── firebase.ts   # Firebase config + helpers
├── insights.tsx  # Energy pattern analysis
└── types.ts      # Type definitions
```

## Common Issues

### Build Fails

```bash
# Clear watchman: `watchman watch-del-all`
# Clear metro: `npm start --reset-cache`
# Reinstall: `rm -rf node_modules && npm install`
```

### Firebase Connection

- Verify all env vars are set correctly
- Check Firestore is enabled in Firebase Console
- iOS Simulator needs working internet connection

### iOS/Android

- iOS: `xcrun simctl erase all` to reset simulators
- Android: Clear app data if stuck on old version

## Performance Notes

- Keep renders minimal in `index.tsx`
- Memoize callbacks and values when mapping over entries
- Batch Firestore writes when possible
- Use `useCallback` for event handlers passed to children

## Testing

```bash
# Unit tests
npm test

# E2E tests (iOS)
npm run e2e:ios

# E2E tests (Android)
npm run e2e:android
```

## Known Limitations

- Notifications unreliable in iOS simulator
- Firebase free tier quotas (check limits)
- Performance degrades with 1000+ entries
