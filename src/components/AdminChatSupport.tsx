import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ChatMessage, chatService, ChatSession } from '@/lib/chatService';
import { CheckCircle, Clock, MessageCircle, Send, Users, XCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface AdminChatSupportProps {
  currentUser: {
    id: string;
    name: string;
    email: string;
  };
}

const AdminChatSupport: React.FC<AdminChatSupportProps> = ({ currentUser }) => {
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'open' | 'closed'>('all');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load all chat sessions
  useEffect(() => {
    console.log('🔔 AdminChatSupport: Subscribing to all chat sessions');

    const unsubscribe = chatService.subscribeToAllChatSessions((sessions) => {
      console.log('📋 AdminChatSupport: Received sessions update:', sessions.length, 'sessions');
      setChatSessions(sessions);
    });

    return () => unsubscribe();
  }, []);

  // Load messages when chat is selected
  useEffect(() => {
    if (selectedChat?.id) {
      console.log('🔔 AdminChatSupport: Subscribing to messages for chat:', selectedChat.id);

      const unsubscribe = chatService.subscribeToChatMessages(selectedChat.id, (messages) => {
        console.log('📨 AdminChatSupport: Received messages update:', messages.length, 'messages');
        setMessages(messages);
        // Mark messages as read
        chatService.markMessagesAsRead(selectedChat.id!, currentUser.id);
      });

      return () => unsubscribe();
    }
  }, [selectedChat?.id, currentUser.id]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat?.id) return;

    console.log('🔧 AdminChatSupport: Sending message:', {
      chatId: selectedChat.id,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: 'admin',
      content: newMessage
    });

    try {
      await chatService.sendMessage(
        selectedChat.id,
        currentUser.id,
        currentUser.name,
        'admin',
        newMessage
      );
      console.log('✅ AdminChatSupport: Message sent successfully');
      setNewMessage('');
    } catch (error) {
      console.error('❌ AdminChatSupport: Failed to send message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleAssignToSelf = async (chatId: string) => {
    console.log('🔧 AdminChatSupport: Assigning chat to self:', chatId);
    try {
      await chatService.assignAdminToChat(chatId, currentUser.id, currentUser.name);
      console.log('✅ AdminChatSupport: Successfully assigned chat to self');
      toast({
        title: 'Chat Assigned',
        description: 'You have been assigned to this chat.',
      });
    } catch (error) {
      console.error('❌ AdminChatSupport: Failed to assign chat:', error);
      toast({
        title: 'Error',
        description: 'Failed to assign chat. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleCloseChat = async (chatId: string) => {
    try {
      await chatService.closeChatSession(chatId);
      toast({
        title: 'Chat Closed',
        description: 'The chat session has been closed.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to close chat. Please try again.',
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

  const filteredSessions = chatSessions.filter(session => {
    if (filter === 'all') return true;
    return session.status === filter;
  });

  const pendingCount = chatSessions.filter(s => s.status === 'pending').length;
  const openCount = chatSessions.filter(s => s.status === 'open').length;
  const closedCount = chatSessions.filter(s => s.status === 'closed').length;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Support Dashboard</h1>
        <p className="text-gray-600">Manage customer support requests</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold">{chatSessions.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Open</p>
                <p className="text-2xl font-bold text-green-600">{openCount}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Closed</p>
                <p className="text-2xl font-bold text-gray-600">{closedCount}</p>
              </div>
              <XCircle className="h-8 w-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chat Sessions List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Support Requests</CardTitle>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={filter === 'all' ? 'default' : 'outline'}
                onClick={() => setFilter('all')}
              >
                All
              </Button>
              <Button
                size="sm"
                variant={filter === 'pending' ? 'default' : 'outline'}
                onClick={() => setFilter('pending')}
              >
                Pending
              </Button>
              <Button
                size="sm"
                variant={filter === 'open' ? 'default' : 'outline'}
                onClick={() => setFilter('open')}
              >
                Open
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {filteredSessions.map((session) => (
                <div
                  key={session.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedChat?.id === session.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedChat(session)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm truncate">
                      {session.subject || 'Support Request'}
                    </h4>
                    {getStatusBadge(session.status)}
                  </div>
                  <div className="text-xs text-gray-500 mb-2">
                    {session.userName} ({session.userEmail})
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{formatDate(session.lastMessageAt)}</span>
                    {session.unreadCount > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {session.unreadCount}
                      </Badge>
                    )}
                  </div>
                  {session.adminName && (
                    <div className="text-xs text-gray-500 mt-1">
                      Assigned to: {session.adminName}
                    </div>
                  )}
                  {session.status === 'pending' && (
                    <Button
                      size="sm"
                      className="mt-2 w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAssignToSelf(session.id!);
                      }}
                    >
                      Assign to Me
                    </Button>
                  )}
                </div>
              ))}
              {filteredSessions.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <MessageCircle className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No support requests</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Chat Messages */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>
              {selectedChat ? (
                <div className="flex items-center justify-between">
                  <div>
                    <span>{selectedChat.subject || 'Support Request'}</span>
                    <div className="text-sm text-gray-500">
                      {selectedChat.userName} ({selectedChat.userEmail})
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(selectedChat.status)}
                    {selectedChat.status === 'open' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCloseChat(selectedChat.id!)}
                      >
                        Close Chat
                      </Button>
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
                    console.log('🔍 AdminChatSupport: Rendering messages:', messages);
                    return null;
                  })()}
                  {messages.map((message) => {
                    console.log('🔍 AdminChatSupport: Message:', message);
                    return (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.senderRole === 'admin' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.senderRole === 'admin'
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
                              message.senderRole === 'admin'
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
                    placeholder="Type your response..."
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

export default AdminChatSupport;
