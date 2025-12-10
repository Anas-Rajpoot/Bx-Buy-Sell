import { useState, useEffect, useRef } from "react";
import { apiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Search, Video, MoreVertical, UserPlus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { toast } from "sonner";
import { ChatAssignmentDialog } from "./ChatAssignmentDialog";
import { useAuth } from "@/hooks/useAuth";
import { Socket } from "socket.io-client";
import { createSocketConnection, getWebSocketUrl } from "@/lib/socket";

interface Message {
  id: string;
  content: string | null;
  senderId: string;
  createdAt: string;
  read: boolean;
  type?: string;
  sender?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    profile_pic: string | null;
  };
}

interface AdminChatWindowProps {
  conversationId: string;
}

export const AdminChatWindow = ({ conversationId }: AdminChatWindowProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [conversation, setConversation] = useState<any>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchConversationDetails();
    connectSocket();

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const connectSocket = () => {
    // Use centralized socket service
    const wsUrl = getWebSocketUrl();
    
    console.log('🔌 Admin connecting to Socket.IO server:', wsUrl);
    console.log('🌐 WebSocket URL:', wsUrl);
    
    const newSocket = createSocketConnection({
      transports: ['websocket', 'polling'],
      reconnection: true,
      auth: {
        token: localStorage.getItem('auth_token') // Pass auth token
      }
    });

    newSocket.on('connect', () => {
      console.log('✅ Admin Socket.IO connected successfully! ID:', newSocket.id);
      setIsConnected(true);
      
      // Join the chat room
      newSocket.emit('join:room', { chatId: conversationId });
      console.log('📥 Admin joined room:', conversationId);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('❌ Admin Socket.IO disconnected:', reason);
      setIsConnected(false);
      if (reason === 'io server disconnect') {
        // Server disconnected the socket, try to reconnect manually
        newSocket.connect();
      }
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Admin Socket.IO connection error:', error);
      console.error('Error details:', {
        message: error.message,
        type: error.type,
        description: error.description,
      });
      setIsConnected(false);
      
      // Only show error toast once, not on every reconnection attempt
      if (newSocket.io.reconnecting) {
        console.log('🔄 Reconnecting...');
      } else {
        toast.error(`Connection error: ${error.message || 'Cannot connect to chat server'}. Please ensure the backend server is running and WebSocket gateway is initialized.`);
      }
    });

    // Listen for messages
    newSocket.on('message', (data: string) => {
      try {
        const message = typeof data === 'string' ? JSON.parse(data) : data;
        if (message.chatId === conversationId) {
          setMessages(prev => {
            // Avoid duplicates
            if (prev.find(m => m.id === message.id)) {
              return prev;
            }
            return [...prev, {
              id: message.id || Date.now().toString(),
              content: message.content,
              senderId: message.senderId,
              createdAt: message.createdAt || new Date().toISOString(),
              read: message.read || false,
              type: message.type
            }];
          });
          scrollToBottom();
        }
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    });

    // Listen for message:recieve event
    newSocket.on('message:recieve', (data: string) => {
      try {
        const message = typeof data === 'string' ? JSON.parse(data) : data;
        if (message.chatId === conversationId) {
          setMessages(prev => {
            // Avoid duplicates
            if (prev.find(m => m.id === message.id)) {
              return prev;
            }
            return [...prev, {
              id: message.id || Date.now().toString(),
              content: message.content,
              senderId: message.senderId,
              createdAt: message.createdAt || new Date().toISOString(),
              read: message.read || false,
              type: message.type
            }];
          });
          scrollToBottom();
        }
      } catch (error) {
        console.error('Error parsing message:recieve:', error);
      }
    });

    setSocket(newSocket);
  };

  const fetchConversationDetails = async () => {
    try {
      const response = await apiClient.getChatById(conversationId);
      
      if (!response.success) {
        console.error('Error fetching conversation:', response.error);
        toast.error('Failed to load conversation');
        return;
      }

      const chat = response.data as any;
      setConversation(chat);
      
      // Set messages from the chat data
      if (chat.messages && Array.isArray(chat.messages)) {
        setMessages(chat.messages.map((msg: any) => ({
          id: msg.id,
          content: msg.content,
          senderId: msg.senderId,
          createdAt: msg.createdAt,
          read: msg.read || false,
          type: msg.type,
          sender: msg.sender
        })));
      }
    } catch (error) {
      console.error('Error fetching conversation details:', error);
      toast.error('Failed to load conversation');
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user?.id || !socket || !isConnected) {
      if (!isConnected) {
        toast.error('Connection not ready. Please wait...');
      }
      return;
    }

    const messageData = {
      chatId: conversationId,
      senderId: user.id,
      content: newMessage.trim(),
      role: 'MONITER', // Admin role
    };

    try {
      // Send via Socket.IO
      socket.emit('message:send:admin', messageData);

      // Optimistically add message to UI
      const tempMessage: Message = {
        id: Date.now().toString(),
        content: newMessage.trim(),
        senderId: user.id,
        createdAt: new Date().toISOString(),
        read: false,
        type: 'ADMIN',
        sender: {
          id: user.id,
          first_name: user.first_name || '',
          last_name: user.last_name || '',
          email: user.email || '',
          profile_pic: user.profile_pic || null,
        }
      };

      setMessages(prev => [...prev, tempMessage]);
      setNewMessage("");
      scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading conversation...</p>
        </div>
      </div>
    );
  }

  const buyerName = `${conversation.user?.first_name || ''} ${conversation.user?.last_name || ''}`.trim() || 'Buyer';
  const sellerName = `${conversation.seller?.first_name || ''} ${conversation.seller?.last_name || ''}`.trim() || 'Seller';
  const memberCount = 3; // buyer + seller + admin
  const onlineCount = 1; // TODO: Add real-time presence

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Chat Header */}
      <div className="border-b px-6 py-4 bg-card">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">{buyerName} ↔ {sellerName}</h2>
            <p className="text-sm text-muted-foreground">
              {memberCount} Members, {onlineCount} online
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setAssignDialogOpen(true)}
              className="gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Assign
            </Button>
            <Button variant="ghost" size="icon">
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Video className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isSender = message.senderId === user?.id;
            const isFromBuyer = message.senderId === conversation.user?.id;
            const isFromSeller = message.senderId === conversation.seller?.id;
            const isAdmin = message.type === 'ADMIN' || (!isFromBuyer && !isFromSeller);
            
            // Get sender info
            let senderName = 'User';
            let senderAvatar = null;
            
            if (message.sender) {
              senderName = `${message.sender.first_name || ''} ${message.sender.last_name || ''}`.trim() || 'User';
              senderAvatar = message.sender.profile_pic;
            } else if (isFromBuyer) {
              senderName = buyerName;
              senderAvatar = conversation.user?.profile_pic;
            } else if (isFromSeller) {
              senderName = sellerName;
              senderAvatar = conversation.seller?.profile_pic;
            }

            return (
              <div key={message.id} className={`flex gap-3 ${isSender ? 'flex-row-reverse' : ''}`}>
                {!isSender && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={senderAvatar || ''} />
                    <AvatarFallback>{senderName[0]?.toUpperCase() || 'U'}</AvatarFallback>
                  </Avatar>
                )}
                
                <div className={`flex flex-col ${isSender ? 'items-end' : ''}`}>
                  {!isSender && (
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">@{senderName}</span>
                      {isAdmin && (
                        <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-700 text-xs">
                          Official EX-Support
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  <div className={`rounded-2xl px-4 py-2 max-w-md ${
                    isSender 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted'
                  }`}>
                    <p className="text-sm">{message.content}</p>
                  </div>
                  
                  <span className="text-xs text-muted-foreground mt-1">
                    {format(new Date(message.createdAt), 'dd MMM yyyy, hh:mm a')}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t p-4 bg-card">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Your message"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
            disabled={!socket || !isConnected}
          />
          <Button 
            onClick={sendMessage}
            size="icon"
            disabled={!newMessage.trim() || !socket || !isConnected}
            className="bg-[#D4FF00] hover:bg-[#D4FF00]/90 text-black rounded-full h-10 w-10"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        {!isConnected && (
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Connecting to chat server...
          </p>
        )}
        {socket && !isConnected && (
          <div className="mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded text-xs text-destructive text-center">
            Connection error. Messages may not update in real-time.
          </div>
        )}
      </div>

      <ChatAssignmentDialog
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
        conversationId={conversationId}
        onAssigned={fetchConversationDetails}
      />
    </div>
  );
};
