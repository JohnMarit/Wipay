import { addDoc, collection, doc, getDocs, onSnapshot, orderBy, query, updateDoc, where, writeBatch } from 'firebase/firestore';
import { db } from './firebase';

export interface ChatMessage {
  id?: string;
  senderId: string;
  senderName: string;
  senderRole: 'user' | 'admin';
  content: string;
  timestamp: Date;
  isRead: boolean;
  chatId: string;
}

export interface ChatSession {
  id?: string;
  userId: string;
  userName: string;
  userEmail: string;
  adminId?: string;
  adminName?: string;
  status: 'open' | 'closed' | 'pending';
  createdAt: Date;
  lastMessageAt: Date;
  unreadCount: number;
  subject?: string;
}

export const chatService = {
  // Create a new chat session
  async createChatSession(userId: string, userName: string, userEmail: string, subject?: string): Promise<string> {
    try {
      const chatSession: Omit<ChatSession, 'id'> = {
        userId,
        userName,
        userEmail,
        status: 'pending',
        createdAt: new Date(),
        lastMessageAt: new Date(),
        unreadCount: 0,
        subject,
      };

      const docRef = await addDoc(collection(db, 'chatSessions'), chatSession);
      return docRef.id;
    } catch (error) {
      console.error('Error creating chat session:', error);
      throw new Error('Failed to create chat session');
    }
  },

  // Get chat sessions for a user
  async getUserChatSessions(userId: string): Promise<ChatSession[]> {
    try {
      const q = query(
        collection(db, 'chatSessions'),
        where('userId', '==', userId),
        orderBy('lastMessageAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        lastMessageAt: doc.data().lastMessageAt?.toDate() || new Date(),
      })) as ChatSession[];
    } catch (error) {
      console.error('Error fetching user chat sessions:', error);
      throw new Error('Failed to fetch chat sessions');
    }
  },

  // Get all chat sessions for admin
  async getAllChatSessions(): Promise<ChatSession[]> {
    try {
      const q = query(
        collection(db, 'chatSessions'),
        orderBy('lastMessageAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        lastMessageAt: doc.data().lastMessageAt?.toDate() || new Date(),
      })) as ChatSession[];
    } catch (error) {
      console.error('Error fetching all chat sessions:', error);
      throw new Error('Failed to fetch chat sessions');
    }
  },

  // Get messages for a specific chat
  async getChatMessages(chatId: string): Promise<ChatMessage[]> {
    try {
      const q = query(
        collection(db, 'chatMessages'),
        where('chatId', '==', chatId),
        orderBy('timestamp', 'asc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date(),
      })) as ChatMessage[];
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      throw new Error('Failed to fetch messages');
    }
  },

  // Send a message
  async sendMessage(
    chatId: string,
    senderId: string,
    senderName: string,
    senderRole: 'user' | 'admin',
    content: string
  ): Promise<void> {
    try {
      console.log('📤 Sending message:', { chatId, senderId, senderName, senderRole, content });

      const message: Omit<ChatMessage, 'id'> = {
        chatId,
        senderId,
        senderName,
        senderRole,
        content,
        timestamp: new Date(),
        isRead: false,
      };

      const docRef = await addDoc(collection(db, 'chatMessages'), message);
      console.log('✅ Message sent successfully with ID:', docRef.id);

      // Update chat session
      const chatRef = doc(db, 'chatSessions', chatId);
      await updateDoc(chatRef, {
        lastMessageAt: new Date(),
        unreadCount: 0, // Reset unread count when message is sent
      });
      console.log('✅ Chat session updated');
    } catch (error) {
      console.error('❌ Error sending message:', error);
      throw new Error('Failed to send message');
    }
  },

  // Mark messages as read
  async markMessagesAsRead(chatId: string, userId: string): Promise<void> {
    try {
      const q = query(
        collection(db, 'chatMessages'),
        where('chatId', '==', chatId),
        where('senderId', '!=', userId),
        where('isRead', '==', false)
      );

      const querySnapshot = await getDocs(q);
      const batch = writeBatch(db);

      querySnapshot.docs.forEach(doc => {
        batch.update(doc.ref, { isRead: true });
      });

      await batch.commit();
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  },

  // Assign admin to chat session
  async assignAdminToChat(chatId: string, adminId: string, adminName: string): Promise<void> {
    try {
      const chatRef = doc(db, 'chatSessions', chatId);
      await updateDoc(chatRef, {
        adminId,
        adminName,
        status: 'open',
      });
    } catch (error) {
      console.error('Error assigning admin to chat:', error);
      throw new Error('Failed to assign admin');
    }
  },

  // Close chat session
  async closeChatSession(chatId: string): Promise<void> {
    try {
      const chatRef = doc(db, 'chatSessions', chatId);
      await updateDoc(chatRef, {
        status: 'closed',
      });
    } catch (error) {
      console.error('Error closing chat session:', error);
      throw new Error('Failed to close chat session');
    }
  },

  // Listen to chat messages in real-time
  subscribeToChatMessages(chatId: string, callback: (messages: ChatMessage[]) => void) {
    console.log('🔔 Subscribing to chat messages for chatId:', chatId);

    const q = query(
      collection(db, 'chatMessages'),
      where('chatId', '==', chatId),
      orderBy('timestamp', 'asc')
    );

    return onSnapshot(q, (querySnapshot) => {
      const messages = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date(),
      })) as ChatMessage[];

      console.log('📨 Received messages update:', messages.length, 'messages');
      callback(messages);
    }, (error) => {
      console.error('❌ Error in chat messages subscription:', error);
    });
  },

  // Listen to chat sessions in real-time
  subscribeToChatSessions(userId: string, callback: (sessions: ChatSession[]) => void) {
    console.log('🔔 Subscribing to chat sessions for userId:', userId);

    const q = query(
      collection(db, 'chatSessions'),
      where('userId', '==', userId),
      orderBy('lastMessageAt', 'desc')
    );

    return onSnapshot(q, (querySnapshot) => {
      const sessions = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        lastMessageAt: doc.data().lastMessageAt?.toDate() || new Date(),
      })) as ChatSession[];

      console.log('📋 Received sessions update:', sessions.length, 'sessions');
      callback(sessions);
    }, (error) => {
      console.error('❌ Error in chat sessions subscription:', error);

      // If index is still building, try a simpler query without orderBy
      if (error.message.includes('index') || error.message.includes('building')) {
        console.log('🔄 Index still building, trying fallback query...');

        const fallbackQuery = query(
          collection(db, 'chatSessions'),
          where('userId', '==', userId)
        );

        return onSnapshot(fallbackQuery, (querySnapshot) => {
          const sessions = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
            lastMessageAt: doc.data().lastMessageAt?.toDate() || new Date(),
          })) as ChatSession[];

          // Sort manually since we can't use orderBy
          sessions.sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime());

          console.log('📋 Received sessions update (fallback):', sessions.length, 'sessions');
          callback(sessions);
        }, (fallbackError) => {
          console.error('❌ Error in fallback chat sessions subscription:', fallbackError);
        });
      }
    });
  },

  // Listen to all chat sessions for admin
  subscribeToAllChatSessions(callback: (sessions: ChatSession[]) => void) {
    console.log('🔔 Subscribing to all chat sessions for admin');

    const q = query(
      collection(db, 'chatSessions'),
      orderBy('lastMessageAt', 'desc')
    );

    return onSnapshot(q, (querySnapshot) => {
      const sessions = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        lastMessageAt: doc.data().lastMessageAt?.toDate() || new Date(),
      })) as ChatSession[];

      console.log('📋 Received all sessions update:', sessions.length, 'sessions');
      callback(sessions);
    }, (error) => {
      console.error('❌ Error in all chat sessions subscription:', error);

      // If index is still building, try a simpler query without orderBy
      if (error.message.includes('index') || error.message.includes('building')) {
        console.log('🔄 Index still building, trying fallback query...');

        const fallbackQuery = query(collection(db, 'chatSessions'));

        return onSnapshot(fallbackQuery, (querySnapshot) => {
          const sessions = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
            lastMessageAt: doc.data().lastMessageAt?.toDate() || new Date(),
          })) as ChatSession[];

          // Sort manually since we can't use orderBy
          sessions.sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime());

          console.log('📋 Received all sessions update (fallback):', sessions.length, 'sessions');
          callback(sessions);
        }, (fallbackError) => {
          console.error('❌ Error in fallback all chat sessions subscription:', fallbackError);
        });
      }
    });
  },
};
