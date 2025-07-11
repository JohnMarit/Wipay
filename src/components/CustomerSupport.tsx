import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ChatMessage, chatService, ChatSession } from '@/lib/chatService';
import { MessageCircle, Plus, Send } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface CustomerSupportProps {
  currentUser: {
    id: string;
    name: string;
    email: string;
  };
}

const CustomerSupport: React.FC<CustomerSupportProps> = ({ currentUser }) => {
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showNewChatForm, setShowNewChatForm] = useState(false);
  const [newChatSubject, setNewChatSubject] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat sessions
  useEffect(() => {
    console.log('🔔 CustomerSupport: Subscribing to chat sessions for user:', currentUser.id);

    const unsubscribe = chatService.subscribeToChatSessions(currentUser.id, (sessions) => {
      console.log('📋 CustomerSupport: Received sessions update:', sessions.length, 'sessions');
      console.log('📋 CustomerSupport: Sessions details:', sessions);
      setChatSessions(sessions);

      // If no chat is selected and there are sessions, select the first one
      if (!selectedChat && sessions.length > 0) {
        console.log('🔧 CustomerSupport: Auto-selecting first chat session');
        setSelectedChat(sessions[0]);
      }
    });

    return () => unsubscribe();
  }, [currentUser.id, selectedChat]);

  // Load messages when chat is selected
  useEffect(() => {
    if (selectedChat?.id) {
      console.log('🔔 CustomerSupport: Subscribing to messages for chat:', selectedChat.id);

      const unsubscribe = chatService.subscribeToChatMessages(selectedChat.id, (messages) => {
        console.log('📨 CustomerSupport: Received messages update:', messages.length, 'messages');

        // Check if there are new messages from admin
        const newAdminMessages = messages.filter(msg =>
          msg.senderRole === 'admin' &&
          !messages.some(existing => existing.id === msg.id)
        );

        if (newAdminMessages.length > 0) {
          console.log('🔔 CustomerSupport: New admin messages received:', newAdminMessages.length);
          toast({
            title: 'New Message',
            description: `You have ${newAdminMessages.length} new message(s) from support.`,
          });
        }

        setMessages(messages);
        // Mark messages as read
        chatService.markMessagesAsRead(selectedChat.id!, currentUser.id);
      });

      return () => unsubscribe();
    }
  }, [selectedChat?.id, currentUser.id, toast]);

  const handleCreateNewChat = async () => {
    if (!newChatSubject.trim()) {
      toast({
        title: 'Subject Required',
        description: 'Please enter a subject for your support request.',
        variant: 'destructive',
      });
      return;
    }

    console.log('🔧 CustomerSupport: Creating new chat session:', {
      userId: currentUser.id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      subject: newChatSubject
    });

    setLoading(true);
    try {
      const chatId = await chatService.createChatSession(
        currentUser.id,
        currentUser.name,
        currentUser.email,
        newChatSubject
      );

      console.log('✅ CustomerSupport: Chat session created with ID:', chatId);

      // Send initial message
      await chatService.sendMessage(
        chatId,
        currentUser.id,
        currentUser.name,
        'user',
        `Support request: ${newChatSubject}`
      );

      console.log('✅ CustomerSupport: Initial message sent');

      setNewChatSubject('');
      setShowNewChatForm(false);

      // Automatically select the newly created chat
      const newChat: ChatSession = {
        id: chatId,
        userId: currentUser.id,
        userName: currentUser.name,
        userEmail: currentUser.email,
        status: 'pending',
        createdAt: new Date(),
        lastMessageAt: new Date(),
        unreadCount: 0,
        subject: newChatSubject,
      };
      setSelectedChat(newChat);

      toast({
        title: 'Support Request Created',
        description: 'Your support request has been submitted successfully.',
      });
    } catch (error) {
      console.error('❌ CustomerSupport: Failed to create support request:', error);
      toast({
        title: 'Error',
        description: 'Failed to create support request. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat?.id) return;

    try {
      await chatService.sendMessage(
        selectedChat.id,
        currentUser.id,
        currentUser.name,
        'user',
        newMessage
      );
      setNewMessage('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge className="bg-green-100 text-green-800">Open</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'closed':
        return <Badge className="bg-gray-100 text-gray-800">Closed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Customer Support</h1>
        <p className="text-gray-600">Get help from our support team</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Sessions List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Support Requests</CardTitle>
              <Button
                size="sm"
                onClick={() => setShowNewChatForm(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                New Request
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {showNewChatForm && (
              <div className="mb-4 p-4 border rounded-lg bg-gray-50">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={newChatSubject}
                  onChange={(e) => setNewChatSubject(e.target.value)}
                  placeholder="Brief description of your issue"
                  className="mt-1 mb-3"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleCreateNewChat}
                    disabled={loading}
                  >
                    {loading ? 'Creating...' : 'Create Request'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowNewChatForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {loading && (
                <div className="p-3 border rounded-lg bg-blue-50 border-blue-200">
                  <div className="flex items-center gap-2 text-blue-800">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-sm">Creating support request...</span>
                  </div>
                </div>
              )}

              {chatSessions.map((session) => (
                <div
                  key={session.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedChat?.id === session.id
                      ? 'border-blue-500 bg-blue-50'
                      : session.unreadCount > 0
                      ? 'border-orange-500 bg-orange-50'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedChat(session)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm truncate">
                      {session.subject || 'Support Request'}
                      {session.unreadCount > 0 && (
                        <span className="ml-2 inline-flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs rounded-full">
                          {session.unreadCount}
                        </span>
                      )}
                    </h4>
                    {getStatusBadge(session.status)}
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{formatDate(session.lastMessageAt)}</span>
                    {session.unreadCount > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {session.unreadCount} unread
                      </Badge>
                    )}
                  </div>
                  {session.adminName && (
                    <div className="text-xs text-gray-500 mt-1">
                      Assigned to: {session.adminName}
                    </div>
                  )}
                </div>
              ))}
              {chatSessions.length === 0 && !showNewChatForm && !loading && (
                <div className="text-center py-8 text-gray-500">
                  <MessageCircle className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No support requests yet</p>
                  <p className="text-sm">Create a new request to get started</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Chat Messages */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              {selectedChat ? (
                <div className="flex items-center justify-between">
                  <span>{selectedChat.subject || 'Support Request'}</span>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(selectedChat.status)}
                    {selectedChat.adminName && (
                      <span className="text-sm text-gray-500">
                        Admin: {selectedChat.adminName}
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                'Select a support request to view messages'
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedChat ? (
              <div className="flex flex-col h-96">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                  {(() => {
                    console.log('🔍 CustomerSupport: Rendering messages:', messages);
                    return null;
                  })()}
                  {messages.map((message) => {
                    console.log('🔍 CustomerSupport: Message:', message);
                    return (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.senderRole === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.senderRole === 'user'
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <div className="text-sm">
                            {message.content}
                            <div className="text-xs opacity-70 mt-1">
                              {message.senderName} ({message.senderRole})
                            </div>
                          </div>
                          <div
                            className={`text-xs mt-1 ${
                              message.senderRole === 'user'
                                ? 'text-blue-100'
                                : 'text-gray-500'
                            }`}
                          >
                            {formatDate(message.timestamp)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="flex gap-2">
                  <Textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1"
                    rows={2}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="self-end"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p>Select a support request from the list to view messages</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CustomerSupport;
