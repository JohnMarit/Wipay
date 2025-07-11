const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, orderBy } = require('firebase/firestore');

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBvOkJqXqXqXqXqXqXqXqXqXqXqXqXqXqXq",
  authDomain: "wipay-john.firebaseapp.com",
  projectId: "wipay-john",
  storageBucket: "wipay-john.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdefghijklmnop"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log('🔧 Setting up Firestore indexes for chat system...');
console.log('');

const requiredIndexes = [
  {
    collection: 'chatSessions',
    fields: [
      { fieldPath: 'userId', order: 'ASCENDING' },
      { fieldPath: 'lastMessageAt', order: 'DESCENDING' }
    ],
    description: 'For querying user chat sessions ordered by last message'
  },
  {
    collection: 'chatMessages',
    fields: [
      { fieldPath: 'chatId', order: 'ASCENDING' },
      { fieldPath: 'timestamp', order: 'ASCENDING' }
    ],
    description: 'For querying chat messages ordered by timestamp'
  },
  {
    collection: 'chatMessages',
    fields: [
      { fieldPath: 'chatId', order: 'ASCENDING' },
      { fieldPath: 'senderId', order: 'ASCENDING' },
      { fieldPath: 'isRead', order: 'ASCENDING' }
    ],
    description: 'For marking messages as read'
  }
];

console.log('📋 Required Firestore Indexes:');
console.log('================================');

requiredIndexes.forEach((index, i) => {
  console.log(`${i + 1}. Collection: ${index.collection}`);
  console.log(`   Fields: ${index.fields.map(f => `${f.fieldPath} (${f.order})`).join(', ')}`);
  console.log(`   Description: ${index.description}`);
  console.log('');
});

console.log('🚀 To create these indexes:');
console.log('1. Go to Firebase Console: https://console.firebase.google.com/');
console.log('2. Select your project: wipay-john');
console.log('3. Go to Firestore Database > Indexes');
console.log('4. Click "Create Index" for each index above');
console.log('5. Wait for indexes to build (may take a few minutes)');
console.log('');
console.log('🔗 Direct link to indexes:');
console.log('https://console.firebase.google.com/v1/r/project/wipay-john/firestore/indexes');
console.log('');
console.log('⚠️  Note: Indexes may take 5-10 minutes to build. The chat system will work once they are ready.');
console.log('');
console.log('🔄 Fallback Solution:');
console.log('The chat system now includes fallback queries that will work while indexes are building.');
console.log('You should see "Index still building, trying fallback query..." in the console.');
