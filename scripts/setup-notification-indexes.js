import { initializeApp } from 'firebase/app';
import { collection, getFirestore, orderBy, query, where } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || 'AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || 'wipay-john.firebaseapp.com',
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'wipay-john',
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || 'wipay-john.appspot.com',
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '633048699728',
  appId: process.env.VITE_FIREBASE_APP_ID || '1:633048699728:web:XXXXXXXXXXXXXXXXXXXX',
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-XXXXXXXXXX',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log('🔧 Setting up Firestore indexes for notifications...');

// Define the queries that require composite indexes
const notificationQueries = [
  {
    name: 'Notifications by userId and createdAt (desc)',
    description: 'For subscribing to user notifications ordered by creation date',
    query: query(
      collection(db, 'notifications'),
      where('userId', '==', 'test-user-id'),
      orderBy('createdAt', 'desc')
    ),
    fields: ['userId', 'createdAt'],
    order: ['userId', 'createdAt']
  },
  {
    name: 'Notifications by userId, isArchived=false, and createdAt (desc)',
    description: 'For subscribing to active user notifications',
    query: query(
      collection(db, 'notifications'),
      where('userId', '==', 'test-user-id'),
      where('isArchived', '==', false),
      orderBy('createdAt', 'desc')
    ),
    fields: ['userId', 'isArchived', 'createdAt'],
    order: ['userId', 'isArchived', 'createdAt']
  },
  {
    name: 'Notifications by userId and isArchived=false',
    description: 'For notification counts',
    query: query(
      collection(db, 'notifications'),
      where('userId', '==', 'test-user-id'),
      where('isArchived', '==', false)
    ),
    fields: ['userId', 'isArchived'],
    order: ['userId', 'isArchived']
  },
  {
    name: 'Notifications by userId and isRead=false',
    description: 'For marking all notifications as read',
    query: query(
      collection(db, 'notifications'),
      where('userId', '==', 'test-user-id'),
      where('isRead', '==', false)
    ),
    fields: ['userId', 'isRead'],
    order: ['userId', 'isRead']
  }
];

console.log('\n📋 Required Composite Indexes for Notifications:');
console.log('================================================');

notificationQueries.forEach((queryInfo, index) => {
  console.log(`\n${index + 1}. ${queryInfo.name}`);
  console.log(`   Description: ${queryInfo.description}`);
  console.log(`   Fields: ${queryInfo.fields.join(', ')}`);
  console.log(`   Order: ${queryInfo.order.join(', ')}`);
});

console.log('\n🔗 Manual Setup Instructions:');
console.log('============================');
console.log('1. Go to Firebase Console: https://console.firebase.google.com/');
console.log('2. Select your project: wipay-john');
console.log('3. Navigate to Firestore Database > Indexes');
console.log('4. Click "Create Index"');
console.log('5. Collection ID: notifications');
console.log('6. Add the following composite indexes:');

console.log('\n📝 Index 1:');
console.log('   Collection ID: notifications');
console.log('   Fields:');
console.log('     - userId (Ascending)');
console.log('     - createdAt (Descending)');
console.log('   Query scope: Collection');

console.log('\n📝 Index 2:');
console.log('   Collection ID: notifications');
console.log('   Fields:');
console.log('     - userId (Ascending)');
console.log('     - isArchived (Ascending)');
console.log('     - createdAt (Descending)');
console.log('   Query scope: Collection');

console.log('\n📝 Index 3:');
console.log('   Collection ID: notifications');
console.log('   Fields:');
console.log('     - userId (Ascending)');
console.log('     - isArchived (Ascending)');
console.log('   Query scope: Collection');

console.log('\n📝 Index 4:');
console.log('   Collection ID: notifications');
console.log('   Fields:');
console.log('     - userId (Ascending)');
console.log('     - isRead (Ascending)');
console.log('   Query scope: Collection');

console.log('\n⏳ After creating the indexes, wait for them to build (usually 1-5 minutes)');
console.log('✅ Once built, the notification system will work properly');

console.log('\n🔍 To check index status:');
console.log('1. Go to Firebase Console > Firestore Database > Indexes');
console.log('2. Look for "Building" status on your indexes');
console.log('3. Wait for status to change to "Enabled"');

console.log('\n🚀 Alternative: Use Firebase CLI');
console.log('If you have Firebase CLI installed, you can create indexes programmatically:');
console.log('1. Install Firebase CLI: npm install -g firebase-tools');
console.log('2. Login: firebase login');
console.log('3. Initialize project: firebase init firestore');
console.log('4. Create firestore.indexes.json with the required indexes');
console.log('5. Deploy: firebase deploy --only firestore:indexes');

console.log('\n📊 Expected Index Status URLs:');
console.log('================================');
console.log('Index 1: https://console.firebase.google.com/v1/r/project/wipay-john/firestore/indexes?create_composite=Cltwcm9qZWN0cy93aXBheS1qb2huL2RhdGFiYXNlcy8oZGVmYXVsdCkvY29sbGVjdGlvbkdyb3Vwcy9ub3RpZmljYXRpb25zL2luZGV4ZXMvQ0lDQWdKakZxWk1LEAEaCgoGdXNlcklkEAEaDQoJY3JlYXRlZEF0EAIaDAoIX19uYW1lX18QAg');

console.log('\n✅ Setup complete! Create the indexes in Firebase Console and wait for them to build.');
