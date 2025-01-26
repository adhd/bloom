# bloom 🌱

A mobile app for tracking and optimizing your natural energy patterns throughout the day.

## Overview

bloom helps you understand your natural energy rhythms by tracking your energy levels over time. By identifying your peak energy windows, you can optimize your schedule and improve your productivity.

## Features

- 📊 Simple 1-5 energy level tracking
- 💭 Optional notes for each entry
- 📈 Pattern recognition for energy trends
- 🔔 Daily check-in reminders
- 🌓 Dark/Light mode support
- 🔄 Real-time sync with Firebase
- 📱 Native mobile experience

## Tech Stack

- **Frontend**: React Native + Expo
- **State Management**: React Hooks
- **Backend**: Firebase (Firestore)
- **Language**: TypeScript
- **UI Components**: Native components with custom animations
- **Data Visualization**: Custom insights view

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (for Mac) or Android Emulator
- Firebase account

## Getting Started

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/bloom.git
   cd bloom
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**

   ```bash
   cp .env.example .env
   ```

   Fill in your Firebase configuration in `.env`:

   ```
   FIREBASE_API_KEY=your_api_key_here
   FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   FIREBASE_APP_ID=your_app_id
   FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

4. **Firebase Setup**

   - Create a new Firebase project
   - Enable Firestore Database
   - Set up Authentication (if needed)
   - Update Security Rules for Firestore

5. **Start the development server**
   ```bash
   npm start
   ```
   Then press:
   - `i` for iOS simulator
   - `a` for Android emulator
   - `w` for web browser

## Project Structure

```
bloom/
├── app/                # Main application code
│   ├── index.tsx      # Entry point
│   ├── types.ts       # TypeScript definitions
│   ├── firebase.ts    # Firebase configuration
│   └── insights.tsx   # Insights/Analytics component
├── assets/            # Static assets
└── ...
```

## Key Dependencies

- `expo-notifications`: Push notifications
- `expo-haptics`: Haptic feedback
- `@react-native-firebase/firestore`: Firebase integration
- `expo-linear-gradient`: UI gradients
- `react-native-modal-datetime-picker`: Time selection

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Development Notes

- Use TypeScript for all new files
- Follow the existing code style
- Add comments for complex logic
- Update tests when modifying features
- Keep the bundle size in mind

## Troubleshooting

### Common Issues

1. **Module Resolution Errors**

   ```bash
   npm install
   expo start -c
   ```

2. **Firebase Configuration**

   - Verify `.env` values
   - Check Firebase console permissions
   - Ensure Firestore rules are properly set

3. **iOS/Android Specific Issues**
   - Clean and rebuild
   - Check platform-specific code
   - Verify native dependencies

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Expo team for the amazing framework
- Firebase for the backend infrastructure
- Contributors and users of the app
