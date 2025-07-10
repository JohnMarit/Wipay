# Firebase Setup Guide for Wipay

This guide will help you set up Firebase as the backend for your Wipay WiFi token system.

## Prerequisites

1. Create a Firebase project at https://console.firebase.google.com
2. Enable Authentication and Firestore Database
3. Configure Firebase project settings

## Step 1: Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create a project"
3. Enter project name: `wipay-[your-name]`
4. Enable Google Analytics (optional)
5. Create project

## Step 2: Enable Authentication

1. In your Firebase project, go to "Authentication"
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Email/Password" sign-in method
5. Save changes

## Step 3: Enable Firestore Database

1. Go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (we'll add security rules later)
4. Select a location close to your users
5. Click "Done"

## Step 4: Get Firebase Configuration

1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps"
3. Click "Web app" icon (`</>`)
4. Register app with name "Wipay Web"
5. Copy the Firebase configuration object

## Step 5: Update Firestore Security Rules

1. Go to "Firestore Database" > "Rules"
2. Replace the rules with the content from `firestore.rules` file
3. Click "Publish"

## Step 6: Environment Configuration

Create a `.env` file in the `wipay` directory with your Firebase configuration:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Optional Settings
VITE_DEBUG_MODE=true
VITE_DEFAULT_CURRENCY=SSP
```

## Step 7: Update Firebase Configuration File

Update the configuration in `src/lib/firebase.ts`:

```typescript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};
```

## Step 8: Deploy Firestore Rules

Upload the security rules:

```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project
firebase init firestore

# Deploy rules
firebase deploy --only firestore:rules
```

## Step 9: Test the Application

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open http://localhost:5173
3. Create a new account using the signup form
4. Configure your WiFi network
5. Generate test tokens

## Data Structure

### Users Collection (`/users/{userId}`)
```json
{
  "uid": "firebase_user_id",
  "email": "user@example.com",
  "name": "User Name",
  "phone": "+211900000000",
  "wifiConfig": {
    "ssid": "MyWiFiNetwork",
    "isConfigured": true
  },
  "pricingConfig": {
    "currency": "SSP",
    "prices": {
      "1": 50,
      "3": 120,
      "6": 200,
      "12": 350,
      "24": 500
    }
  },
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### WiFi Tokens Collection (`/wifiTokens/{tokenId}`)
```json
{
  "recipientPhone": "+211900000000",
  "duration": 1,
  "price": 50,
  "currency": "SSP",
  "paymentMethod": "mtn_momo",
  "status": "active",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "expiresAt": "2024-01-01T01:00:00.000Z",
  "username": "wifi_user_123",
  "password": "temp_pass_456",
  "isActive": true,
  "userId": "firebase_user_id"
}
```

## Security Features

- User authentication with Firebase Auth
- Data isolation per user
- Firestore security rules
- Encrypted password storage
- Session management

## Troubleshooting

### Common Issues

1. **"Firebase not initialized"**
   - Check your `.env` file has correct Firebase config
   - Ensure all environment variables are set

2. **"Permission denied" errors**
   - Verify Firestore security rules are deployed
   - Check user is authenticated

3. **"Network error"**
   - Check internet connection
   - Verify Firebase project is active

4. **"Invalid credentials"**
   - Ensure user account exists
   - Check password is correct

### Debug Mode

Enable debug mode in `.env`:
```env
VITE_DEBUG_MODE=true
```

This will show additional console logs and error details.

## Production Deployment

1. Set `VITE_DEBUG_MODE=false`
2. Deploy Firestore rules with stricter security
3. Enable Firebase App Check for additional security
4. Set up Firebase Analytics for usage tracking
5. Configure proper CORS settings

## Support

For Firebase-related issues:
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Console](https://console.firebase.google.com)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)

For Wipay-specific issues:
- Check the browser console for error messages
- Verify your Firebase configuration
- Test with a fresh user account 