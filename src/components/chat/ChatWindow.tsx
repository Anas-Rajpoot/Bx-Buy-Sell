import { useEffect, useState, useRef, useCallback } from "react";
import { Send, Search, Video, MoreVertical, X, UserX, Trash2, User, PhoneOff, Archive, MessageSquare, Paperclip } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { apiClient } from "@/lib/api";
import { formatChatTime } from "@/lib/timeFormatter";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Socket } from "socket.io-client";
import { useAuth } from "@/hooks/useAuth";
import { createSocketConnection, getWebSocketUrl } from "@/lib/socket";

interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  read: boolean;
  type?: string;
  fileUrl?: string; // URL for images/files
}

interface ChatWindowProps {
  conversationId: string;
  currentUserId: string;
  userId: string;
  sellerId: string;
  listingId?: string; // CRITICAL: Optional listingId to scope chat to specific listing
  refreshConversations?: () => void;
}

export const ChatWindow = ({ conversationId, currentUserId, userId, sellerId, listingId, refreshConversations }: ChatWindowProps) => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [chatRoom, setChatRoom] = useState<any>(null);
  const [otherUser, setOtherUser] = useState<any>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isVideoCallDialogOpen, setIsVideoCallDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingChatRoom, setIsLoadingChatRoom] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const chatRoomLoadedRef = useRef(false);
  const sendingMessageRef = useRef(false); // Prevent double sending
  const messagesLoadedFromDBRef = useRef(false); // Track if messages were loaded from DB
  const loadedMessageIdsRef = useRef<Set<string>>(new Set()); // Track IDs of messages loaded from DB
  const pendingTempMessagesRef = useRef<Map<string, string>>(new Map()); // Track temp message IDs by content (for quick replacement)
  const userScrolledUpRef = useRef(false); // Track if user has manually scrolled up
  const shouldAutoScrollRef = useRef(true); // Track if we should auto-scroll
  const listenersRegisteredRef = useRef(false); // Track if socket listeners are already registered

  // Play notification sound for incoming messages
  const playNotificationSound = () => {
    try {
      // Create a simple notification sound using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800; // Higher pitch
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.error('Error playing notification sound:', error);
      // Fallback: Try HTML5 audio if available
      try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTKH0fPTgjMGHm7A7+OZUhA=');
        audio.volume = 0.3;
        audio.play().catch(() => {
          // Ignore if audio play fails (user interaction required in some browsers)
        });
      } catch (e) {
        // Silently fail if audio is not available
      }
    }
  };

  // STEP 1: Load chat room data FIRST - this is critical
  useEffect(() => {
    let mounted = true;

    const initializeChat = async () => {
      console.log('🚀 Initializing chat:', { conversationId, userId, sellerId, listingId });
      setIsLoadingChatRoom(true);
      
      // Reset state when conversation changes
      if (chatRoomLoadedRef.current) {
        chatRoomLoadedRef.current = false;
        setChatRoom(null);
        setMessages([]); // Clear messages to prevent duplicates
        setOtherUser(null);
        setIsConnected(false);
        pendingTempMessagesRef.current.clear(); // Clear pending temp messages
        // Reset scroll state when conversation changes
        userScrolledUpRef.current = false;
        shouldAutoScrollRef.current = true;
        listenersRegisteredRef.current = false; // Reset listener registration flag
      } else {
        // Also clear messages on initial load to prevent duplicates
        setMessages([]);
        pendingTempMessagesRef.current.clear(); // Clear pending temp messages
        // Reset scroll state on initial load
        userScrolledUpRef.current = false;
        shouldAutoScrollRef.current = true;
      }

      try {
      // CRITICAL: Load chat room FIRST and wait for it to complete
        // Load merged conversation (no listingId - all messages with this seller together)
        const loadedChatRoom = await loadChatRoomData(userId, sellerId);
        
        if (!mounted) return;
        
        if (loadedChatRoom?.id && chatRoomLoadedRef.current) {
          // Chat room is loaded, now connect socket immediately
          console.log('✅ Chat room loaded, connecting socket...', { chatRoomId: loadedChatRoom.id });
          setIsLoadingChatRoom(false);
          // CRITICAL: Ensure chatRoom state is set before connecting socket
          // Use the loadedChatRoom directly instead of waiting for state update
          setChatRoom(loadedChatRoom);
          // Small delay to ensure state is set, then connect socket
          requestAnimationFrame(() => {
        connectSocket();
          });
        } else if (!loadedChatRoom) {
          console.error('❌ Chat room failed to load!', { 
            mounted, 
            chatRoomLoaded: chatRoomLoadedRef.current, 
            loadedChatRoomId: loadedChatRoom?.id 
          });
          setIsLoadingChatRoom(false);
        toast.error('Failed to load chat room. Please try again.');
        } else {
          setIsLoadingChatRoom(false);
        }
      } catch (error) {
        console.error('❌ Error initializing chat:', error);
        setIsLoadingChatRoom(false);
        toast.error('Failed to initialize chat. Please try again.');
      }
    };

    initializeChat();

    return () => {
      mounted = false;
      if (socketRef.current) {
        console.log('🧹 Cleaning up socket listeners and disconnecting...');
        // Remove all listeners before disconnecting
        socketRef.current.removeAllListeners('message');
        socketRef.current.removeAllListeners('connect');
        socketRef.current.removeAllListeners('disconnect');
        socketRef.current.removeAllListeners('connect_error');
        socketRef.current.removeAllListeners('error');
        socketRef.current.removeAllListeners('room:joined');
        socketRef.current.emit('leave:room', { chatId: 'all' });
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setSocket(null);
      setIsConnected(false);
      chatRoomLoadedRef.current = false;
      listenersRegisteredRef.current = false; // Reset listener registration flag
    };
  }, [conversationId, userId, sellerId, listingId]);

  // STEP 2: Join room when socket connects AND chatRoom is loaded
  useEffect(() => {
    if (socket && isConnected && chatRoom?.id) {
      console.log('🔄 Socket and chatRoom ready, joining room:', chatRoom.id);
      joinRoom(chatRoom.id);
    } else {
      if (socket && isConnected && !chatRoom?.id) {
        console.warn('⚠️ Socket connected but chatRoom not loaded yet');
      }
      if (chatRoom?.id && (!socket || !isConnected)) {
        console.warn('⚠️ ChatRoom loaded but socket not connected yet');
      }
    }
  }, [socket, isConnected, chatRoom?.id]);

  // Mark all messages as read for this chat
  const markAllMessagesAsRead = useCallback(async (chatId: string) => {
    if (!currentUserId || !chatId) {
      console.warn('⚠️ Cannot mark messages as read: missing userId or chatId', { currentUserId, chatId });
      return;
    }
    
    try {
      console.log('🔔 Marking messages as read for chat:', chatId, 'user:', currentUserId);
      const response = await apiClient.markMessagesAsRead(chatId, currentUserId);
      if (response.success) {
        console.log('✅ Messages marked as read for chat:', chatId);
        // Update local message state to reflect read status immediately
        setMessages(prev => prev.map(msg => 
          msg.senderId !== currentUserId ? { ...msg, read: true } : msg
        ));
        // Refresh conversation list to update unread count - multiple refreshes to ensure it updates
        if (refreshConversations) {
          refreshConversations(); // Immediate refresh
          setTimeout(() => refreshConversations(), 300);
          setTimeout(() => refreshConversations(), 800);
          setTimeout(() => refreshConversations(), 1500);
          setTimeout(() => refreshConversations(), 2500);
          setTimeout(() => refreshConversations(), 4000);
        }
      } else {
        console.error('❌ Failed to mark messages as read:', response.error);
        // Even if backend fails, update local state to show messages as read in UI
        setMessages(prev => prev.map(msg => 
          msg.senderId !== currentUserId ? { ...msg, read: true } : msg
        ));
        if (refreshConversations) {
          refreshConversations();
        }
      }
    } catch (error: any) {
      console.error('❌ Error marking messages as read:', error);
      // Even if it fails, update local state to show messages as read in UI
      setMessages(prev => prev.map(msg => 
        msg.senderId !== currentUserId ? { ...msg, read: true } : msg
      ));
      if (refreshConversations) {
        refreshConversations();
      }
    }
  }, [currentUserId, refreshConversations]);

  // STEP 3: Mark messages as read when chat window is opened/viewed AND messages are loaded
  useEffect(() => {
    if (chatRoom?.id && currentUserId && !isSearchOpen && messagesLoadedFromDBRef.current) {
      console.log('🔔 Chat window opened, marking messages as read:', chatRoom.id);
      markAllMessagesAsRead(chatRoom.id);
      
      // Mark again after delays to ensure it completes and conversation list updates
      const timer1 = setTimeout(() => {
        markAllMessagesAsRead(chatRoom.id);
      }, 500);
      
      const timer2 = setTimeout(() => {
        markAllMessagesAsRead(chatRoom.id);
      }, 1500);
      
      const timer3 = setTimeout(() => {
        markAllMessagesAsRead(chatRoom.id);
      }, 3000);
      
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [chatRoom?.id, currentUserId, isSearchOpen, messagesLoadedFromDBRef.current, markAllMessagesAsRead]);

  // Check if user is at bottom of scroll container
  const isAtBottom = (): boolean => {
    const container = messagesContainerRef.current;
    if (!container) return true;
    
    const threshold = 100; // 100px threshold from bottom
    const scrollTop = container.scrollTop;
    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight;
    
    return scrollHeight - scrollTop - clientHeight < threshold;
  };

  // Scroll to bottom only if user is already at bottom
  const scrollToBottom = (force: boolean = false) => {
    // If forced (e.g., when sending own message), always scroll
    // Otherwise, only scroll if user is at bottom AND hasn't manually scrolled up
    if (force) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      userScrolledUpRef.current = false;
      shouldAutoScrollRef.current = true;
    } else if (shouldAutoScrollRef.current && isAtBottom()) {
      // Only auto-scroll if user hasn't manually scrolled up
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    } else {
      console.log('🚫 Auto-scroll blocked - user has scrolled up');
    }
  };

  // Handle scroll events to detect when user scrolls up
  const handleScroll = () => {
    const atBottom = isAtBottom();
    if (!atBottom) {
      // User has scrolled up - disable auto-scroll
      userScrolledUpRef.current = true;
      shouldAutoScrollRef.current = false;
      console.log('👆 User scrolled up, disabling auto-scroll');
    } else {
      // User is at bottom - enable auto-scroll
      userScrolledUpRef.current = false;
      shouldAutoScrollRef.current = true;
      console.log('👇 User at bottom, enabling auto-scroll');
    }
  };

  // Scroll to bottom when messages change, but only if user is at bottom
  useEffect(() => {
    // CRITICAL: Only auto-scroll if:
    // 1. User hasn't manually scrolled up (shouldAutoScrollRef is true)
    // 2. AND user is actually at the bottom (isAtBottom returns true)
    // Don't auto-scroll if user has scrolled up, even if they're close to bottom
    // Skip if messages are empty (initial state)
    if (messages.length === 0) return;
    
    if (shouldAutoScrollRef.current && isAtBottom()) {
      // Use requestAnimationFrame for better performance and to ensure DOM has updated
      requestAnimationFrame(() => {
        // Double-check conditions before scrolling
        if (shouldAutoScrollRef.current && isAtBottom() && messages.length > 0) {
          scrollToBottom(false);
        }
      });
    } else {
      console.log('🚫 Auto-scroll skipped - user scrolled up or not at bottom');
    }
  }, [messages]);

  // Load chat room data from API - returns the loaded chat room
  const loadChatRoomData = async (userId: string, sellerId: string, listingId?: string): Promise<any> => {
    try {
      // Load merged conversation with this seller (ignore listingId - all messages together)
      console.log('📥 Loading chat room data:', { userId, sellerId });
      const response = await apiClient.getChatRoom(userId, sellerId);
      
      // Handle successful response - data can be null if chat room doesn't exist
      if (response.success) {
        // Extract chat data - handle both wrapped and direct responses
        const chat = (response.data as any)?.data || response.data;
        
        // If no chat room exists (response.data is null or chat is null/undefined)
        if (!chat || !chat.id) {
          console.log('🆕 Chat room not found, creating new one with seller:', sellerId);
          const createResponse = await apiClient.createChatRoom(userId, sellerId);
          if (createResponse.success && createResponse.data) {
            const newChat = (createResponse.data as any).data || createResponse.data;
            if (newChat && newChat.id) {
              setChatRoom(newChat);
              chatRoomLoadedRef.current = true;
              
              // Clear existing messages first to prevent duplicates
              setMessages([]);
              messagesLoadedFromDBRef.current = false;
              loadedMessageIdsRef.current.clear();
              pendingTempMessagesRef.current.clear(); // Clear pending temp messages
              
              // Small delay to ensure state is cleared
              await new Promise(resolve => setTimeout(resolve, 100));
              
              // Load messages
              if (newChat.messages && Array.isArray(newChat.messages)) {
                loadMessages(newChat.messages);
                
                // Mark messages as read after loading
                if (newChat.messages.length > 0) {
                  setTimeout(() => {
                    markAllMessagesAsRead(newChat.id);
                  }, 500);
                }
              }
              
              // Load other user
              await loadOtherUser(newChat);
              return newChat; // Return the chat room
            }
          }
          console.error('Failed to create chat room:', createResponse);
          chatRoomLoadedRef.current = false;
          return null;
        }
        
        console.log('✅ Loaded chat room (merged conversation):', {
          id: chat.id,
          userId: chat.userId,
          sellerId: chat.sellerId,
          messagesCount: chat.messages?.length || 0
        });
        
        setChatRoom(chat);
        chatRoomLoadedRef.current = true;
        
        // Clear existing messages first to prevent duplicates when reloading
        setMessages([]);
        messagesLoadedFromDBRef.current = false;
        loadedMessageIdsRef.current.clear();
        pendingTempMessagesRef.current.clear(); // Clear pending temp messages
        
        // Small delay to ensure state is cleared before loading new messages
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Load messages from database
        if (chat.messages && Array.isArray(chat.messages)) {
          loadMessages(chat.messages);
          
          // Mark messages as read after loading
          if (chat.messages.length > 0) {
            setTimeout(() => {
              markAllMessagesAsRead(chat.id);
            }, 500);
          }
        }
        
        // Load other user
        await loadOtherUser(chat);
        return chat; // Return the chat room
      } else {
        console.error('Failed to load chat room:', response.error);
        chatRoomLoadedRef.current = false;
        return null;
      }
    } catch (error) {
      console.error('Error loading chat room data:', error);
      chatRoomLoadedRef.current = false;
      return null;
    }
  };

  const loadMessages = (messagesData: any[]) => {
    // Remove duplicates by ID before processing
    const uniqueMessages = messagesData.filter((msg, index, self) => 
      index === self.findIndex(m => m.id === msg.id)
    );
    
    const sortedMessages = uniqueMessages
      .map((msg: any) => ({
        id: msg.id,
        content: msg.content,
        senderId: msg.senderId,
        createdAt: msg.createdAt,
        read: msg.read || false,
        type: msg.type || 'TEXT',
        fileUrl: msg.fileUrl || null
      }))
      .sort((a: Message, b: Message) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    
    console.log('📥 Loaded messages from DB:', sortedMessages.length, '(unique:', uniqueMessages.length, ')');
    
    // Track which message IDs were loaded from DB to prevent WebSocket duplicates on refresh
    // Also track by content+sender+time for better duplicate detection
    loadedMessageIdsRef.current = new Set(sortedMessages.map(m => m.id));
    messagesLoadedFromDBRef.current = true;
    
    // Always replace messages (don't merge) to prevent duplicates when reopening conversation
    // The messages will be merged with WebSocket messages in handleIncomingMessage if needed
    setMessages(sortedMessages);
    
    // Clear pending temp messages when loading from DB (they're now in DB)
    pendingTempMessagesRef.current.clear();
    
    // Scroll to bottom when initially loading messages from DB
    // Only scroll if user hasn't manually scrolled up (should be true on initial load)
    // Use requestAnimationFrame for better performance
    requestAnimationFrame(() => {
      // Only force scroll on initial load if user hasn't scrolled up
      if (shouldAutoScrollRef.current) {
        scrollToBottom(true); // Force scroll on initial load
      }
    });
  };

  const loadOtherUser = async (chat: any) => {
    // CRITICAL: Chat room should include user and seller data from backend
    // If data is already in the chat object, use it directly
    if (chat.user && chat.seller) {
      // Determine which user is the "other" user based on currentUserId
      const otherUserData = chat.userId === currentUserId ? chat.seller : chat.user;
      
      console.log('✅ Using user data from chat room:', {
        currentUserId,
        chatUserId: chat.userId,
        chatSellerId: chat.sellerId,
        otherUserId: otherUserData.id,
        otherUserName: `${otherUserData.first_name} ${otherUserData.last_name}`.trim()
      });
      
      setOtherUser(otherUserData);
      return;
    }
    
    // Fallback: If user/seller data not included, fetch it
    console.warn('⚠️ User/seller data not in chat room, fetching separately');
    const otherUserId = chat.userId === currentUserId ? chat.sellerId : chat.userId;
    const userResponse = await apiClient.getUserById(otherUserId);
    
    if (userResponse.success && userResponse.data) {
      setOtherUser(userResponse.data);
    } else {
      console.error('❌ Failed to fetch user data:', userResponse.error);
      // Set a fallback object to avoid showing "Unknown User"
      setOtherUser({
        id: otherUserId,
        first_name: 'User',
        last_name: '',
        email: '',
        profile_pic: null
      });
    }
  };

  // Connect WebSocket - called AFTER chat room is loaded
  const connectSocket = () => {
    // Use chatRoom from state
    const currentChatRoomId = chatRoom?.id;
    if (!currentChatRoomId) {
      console.error('❌ Cannot connect socket: chatRoom.id not available', { chatRoom });
      setIsConnected(false);
      // Try again after a short delay if chatRoom might still be loading
      setTimeout(() => {
        if (chatRoom?.id) {
          console.log('🔄 Retrying socket connection after chatRoom loaded');
          connectSocket();
        }
      }, 100);
      return;
    }

    const wsUrl = getWebSocketUrl();
    console.log('🔌 Connecting to Socket.IO:', wsUrl, 'for room:', currentChatRoomId);
    
    // Disconnect existing socket if any
    if (socketRef.current) {
      console.log('🔄 Disconnecting existing socket before reconnecting...');
      // Remove all listeners before disconnecting
      socketRef.current.removeAllListeners('message');
      socketRef.current.removeAllListeners('connect');
      socketRef.current.removeAllListeners('disconnect');
      socketRef.current.removeAllListeners('connect_error');
      socketRef.current.removeAllListeners('error');
      socketRef.current.removeAllListeners('room:joined');
      socketRef.current.emit('leave:room', { chatId: currentChatRoomId });
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
      listenersRegisteredRef.current = false; // Reset listener registration flag
    }
    
    const newSocket = createSocketConnection({
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 300, // Reduced from 500ms to 300ms
      timeout: 3000, // Reduced from 5000ms to 3000ms (3 seconds) for faster connection
      forceNew: true, // Force new connection
      upgrade: true, // Allow transport upgrade
    });
    
    socketRef.current = newSocket;
    setSocket(newSocket);
    setIsConnected(false); // Reset connection state

    // Set connection timeout (reduced to 3 seconds)
    const connectionTimeout = setTimeout(() => {
      if (!newSocket.connected) {
        console.error('❌ Socket connection timeout after 3 seconds');
        setIsConnected(false);
        // Don't show toast immediately - let reconnection attempts happen
      }
    }, 3000);

    newSocket.on('connect', () => {
      console.log('✅ Socket.IO connected! ID:', newSocket.id);
      clearTimeout(connectionTimeout);
      setIsConnected(true);
      
      // Join room immediately - chatRoom.id is guaranteed to exist
      const roomId = chatRoom?.id || currentChatRoomId;
      if (roomId) {
        console.log('🔄 Socket connected, joining room:', roomId);
        // Join immediately without delay
        joinRoom(roomId);
      } else {
        console.warn('⚠️ Socket connected but chatRoom.id not available yet');
        // Wait for chatRoom to be set, then join
        const checkChatRoom = setInterval(() => {
          if (chatRoom?.id) {
            clearInterval(checkChatRoom);
            joinRoom(chatRoom.id);
          }
        }, 100);
        // Clear interval after 5 seconds to prevent infinite loop
        setTimeout(() => clearInterval(checkChatRoom), 5000);
      }
    });

    newSocket.on('disconnect', (reason) => {
      console.log('❌ Socket.IO disconnected:', reason);
      setIsConnected(false);
      if (reason === 'io server disconnect') {
        newSocket.connect();
      }
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Socket.IO connection error:', error);
      console.error('Connection error details:', {
        message: error.message,
        type: error.type,
        description: error.description
      });
      clearTimeout(connectionTimeout);
      setIsConnected(false);
      // Don't show toast immediately - let reconnection attempts happen
      // Only show error if reconnection fails multiple times
    });
    
    // Listen for room join confirmation
    newSocket.on('room:joined', (data: { chatId: string; success: boolean; clientCount: number }) => {
      console.log('✅ Room join confirmed:', data);
      if (data.chatId === chatRoom?.id) {
        console.log('✅ Successfully joined correct room:', data.chatId, 'with', data.clientCount, 'other client(s)');
      }
    });
    
    newSocket.on('error', (error: any) => {
      console.error('❌ Socket error:', error);
      toast.error(error.message || 'Socket connection error');
    });

    // Listen for incoming messages - only listen to ONE event type to prevent duplicates
    // Backend only sends 'message' event now (removed 'message:recieve' to prevent duplicates)
    // CRITICAL: Remove any existing listeners first to prevent multiple registrations
    // Use a ref to ensure we only register listeners once per socket instance
    if (!listenersRegisteredRef.current) {
      newSocket.removeAllListeners('message');
      newSocket.on('message', (data: string) => {
        console.log('📨 WS message event received, id:', typeof data === 'string' ? JSON.parse(data)?.id : data?.id);
        handleIncomingMessage(data, 'message');
      });
      listenersRegisteredRef.current = true;
      console.log('👂 Registered message listener on socket:', newSocket.id);
    } else {
      console.warn('⚠️ Listeners already registered, skipping duplicate registration');
    }
  };

  // Join room - simplified, no retries needed since chatRoom.id is guaranteed
  const joinRoom = (chatId: string) => {
    if (!socketRef.current || !chatId) {
      console.warn('⚠️ Cannot join room: socket or chatId missing', {
        hasSocket: !!socketRef.current,
        chatId: chatId,
        socketConnected: socketRef.current?.connected
      });
      return;
    }

    if (!socketRef.current.connected) {
      console.warn('⚠️ Socket not connected, waiting...');
      socketRef.current.once('connect', () => {
        console.log('✅ Socket connected, now joining room:', chatId);
        joinRoom(chatId);
      });
      return;
    }

    console.log('📥 Joining room:', chatId, {
      socketId: socketRef.current.id,
      socketConnected: socketRef.current.connected
    });
    
    // Leave all rooms first
    socketRef.current.emit('leave:room', { chatId: 'all' });
    
    // Join the room immediately (no delay)
      socketRef.current.emit('join:room', { chatId }, (response: any) => {
        if (response?.error) {
          console.error('❌ Error joining room:', response.error);
        } else {
          console.log('✅ Join room acknowledged:', chatId);
        }
      });
  };

  // Handle incoming messages - use conversationId as fallback
  const handleIncomingMessage = (data: string, eventType: string) => {
    try {
      const message = typeof data === 'string' ? JSON.parse(data) : data;
      
      // Log received message
      console.log('📨 WS new_message received, id:', message.id, {
        messageChatId: message.chatId,
        senderId: message.senderId,
        content: message.content?.substring(0, 30)
      });
      
      // Use chatRoom.id if available, otherwise use conversationId as fallback
      const expectedChatId = chatRoom?.id || conversationId;
      
      // Accept message if chatId matches OR if chatRoom not loaded yet (use conversationId)
      if (message.chatId === expectedChatId || message.chatId === conversationId) {
        console.log('✅ ACCEPTED message:', {
          messageId: message.id,
          messageChatId: message.chatId,
          expectedChatId,
          conversationId,
          senderId: message.senderId,
          isFromMe: message.senderId === currentUserId
        });
        
        // Check if chat is blocked
        if (chatRoom?.status === 'FLAGGED') {
          console.warn('⚠️ Chat is blocked, ignoring message');
          return;
        }
        
        // CRITICAL: Prevent duplicates - check multiple conditions
        setMessages(prev => {
          // 1. Check if message ID already exists
          const existingById = prev.find(m => m.id === message.id);
          if (existingById) {
            console.log('⚠️ Duplicate message detected (same ID), skipping:', message.id);
            return prev;
          }
          
          // 2. If messages were loaded from DB, ignore WebSocket messages that were already in DB
          if (messagesLoadedFromDBRef.current && loadedMessageIdsRef.current.has(message.id)) {
            console.log('⚠️ Message already loaded from DB, ignoring WebSocket duplicate:', message.id);
            return prev;
          }
          
          // 3. CRITICAL: First check for temp message to replace (optimistic update)
          // If this is a message from current user, try to find and replace the temp message
          if (message.senderId === currentUserId) {
            // First try to find by tracked temp message ID (fastest method)
            const trackedTempId = pendingTempMessagesRef.current.get(message.content);
            if (trackedTempId) {
              const tempMessageIndex = prev.findIndex(m => m.id === trackedTempId);
              if (tempMessageIndex !== -1) {
                console.log('🔄 Replacing tracked temp message with real message:', trackedTempId, '→', message.id);
                pendingTempMessagesRef.current.delete(message.content); // Remove from tracking
                const updated = [...prev];
                updated[tempMessageIndex] = {
                  id: message.id,
                  content: message.content,
                  senderId: message.senderId,
                  createdAt: message.createdAt,
                  read: message.read || false,
                  type: message.type || 'TEXT',
                  fileUrl: message.fileUrl || null
                };
                return updated; // Return immediately after replacement
              }
            }
            
            // Fallback: Look for any temp message from current user with same content
            // Use a wider time window (15 seconds) to catch optimistic messages
            const tempMessageIndex = prev.findIndex(m => 
            m.id.startsWith('temp-') &&
            m.content === message.content &&
              m.senderId === currentUserId &&
              Math.abs(new Date(m.createdAt).getTime() - new Date(message.createdAt).getTime()) < 15000
          );
          
            if (tempMessageIndex !== -1) {
              console.log('🔄 Replacing temp message with real message (fallback):', prev[tempMessageIndex].id, '→', message.id);
              // Remove from tracking if it was there
              pendingTempMessagesRef.current.delete(message.content);
            const updated = [...prev];
              updated[tempMessageIndex] = {
              id: message.id,
              content: message.content,
              senderId: message.senderId,
              createdAt: message.createdAt,
              read: message.read || false,
                type: message.type || 'TEXT',
                fileUrl: message.fileUrl || null
              };
              return updated; // Return immediately after replacement
            }
          }
          
          // 4. Check for duplicate by content + sender + time (within 3 seconds) - handles same message sent twice
          // Check ALL messages including temp messages for better duplicate detection
          const duplicateByContent = prev.find(m => 
            m.content === message.content && 
            m.senderId === message.senderId && 
            Math.abs(new Date(m.createdAt).getTime() - new Date(message.createdAt).getTime()) < 3000 // Reduced to 3 seconds
          );
          
          if (duplicateByContent) {
            console.log('⚠️ Duplicate message detected (same content/time), skipping:', message.id, 'existing:', duplicateByContent.id);
            return prev; // Don't add duplicate
          }
          
          // 5. Final safety check: Check by exact ID or very close timestamp (within 1 second)
          const finalDuplicateCheck = prev.find(m => {
            // Exact ID match
            if (m.id === message.id) return true;
            // Same content, sender, and very close timestamp (within 1 second)
            if (m.content === message.content && 
                m.senderId === message.senderId && 
                Math.abs(new Date(m.createdAt).getTime() - new Date(message.createdAt).getTime()) < 1000) {
              return true;
            }
            return false;
          });
          
          if (finalDuplicateCheck) {
            console.warn('⚠️ Final duplicate check caught duplicate message, skipping:', message.id, 'existing:', finalDuplicateCheck.id);
            return prev;
          }
          
          // 6. All checks passed - add the message
          console.log('✅ Adding new message:', message.id, message.content.substring(0, 30));
          return [...prev, {
            id: message.id,
            content: message.content,
            senderId: message.senderId,
            createdAt: message.createdAt,
            read: message.read || false,
            type: message.type || 'TEXT',
            fileUrl: message.fileUrl || null
          }];
        });
        
        // Only auto-scroll if user is at bottom (don't interrupt if they're reading old messages)
        // Don't force scroll for incoming messages - respect user's scroll position
        if (shouldAutoScrollRef.current && isAtBottom()) {
          scrollToBottom(false);
        }
        
        // Play notification sound if message is from another user
        if (message.senderId !== currentUserId) {
          playNotificationSound();
        }
        
        // Refresh conversation list
        if (refreshConversations) {
          setTimeout(() => refreshConversations(), 500);
        }
      } else {
        console.log('🚫 REJECTED message from different chat:', {
          messageChatId: message.chatId,
          expectedChatId,
          conversationId
        });
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  };

  // Handle file/image upload
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const chatIdToUse = chatRoom?.id || conversationId;
    if (!chatIdToUse || !currentUserId) {
      toast.error('Chat room not loaded. Please wait...');
      return;
    }

    setIsUploading(true);
    try {
      // Determine file type
      const isImage = file.type.startsWith('image/');
      const uploadType = isImage ? 'photo' : 'attachment';

      // Upload file
      const uploadResponse = await apiClient.uploadFile(file, uploadType);
      
      if (!uploadResponse.success || !uploadResponse.data) {
        throw new Error(uploadResponse.error || 'Upload failed');
      }

      const fileUrl = uploadResponse.data.url || uploadResponse.data.path || '';
      if (!fileUrl) {
        throw new Error('No file URL returned');
      }

      // Send message with file URL
      if (!socketRef.current || !isConnected) {
        toast.error('Connection not ready. Please wait...');
        return;
      }

      const messageContent = isImage ? `📷 Image` : `📎 ${file.name}`;
      
      // Add optimistic message
      const optimisticMessage: Message = {
        id: `temp-${Date.now()}-${Math.random()}`,
        content: messageContent,
        senderId: currentUserId,
        createdAt: new Date().toISOString(),
        read: false,
        type: isImage ? 'IMAGE' : 'FILE',
        fileUrl: fileUrl
      };

      setMessages(prev => {
        if (prev.find(m => m.id === optimisticMessage.id)) {
          return prev;
        }
        return [...prev, optimisticMessage];
      });
      // Force scroll when sending own message
      scrollToBottom(true);

      // Send via WebSocket
      const messageData = {
        chatId: chatIdToUse,
        senderId: currentUserId,
        content: messageContent,
        type: isImage ? 'IMAGE' : 'FILE',
        fileUrl: fileUrl,
        createdAt: new Date().toISOString()
      };

      console.log('📤 Sending file message:', {
        chatId: chatIdToUse,
        type: uploadType,
        fileName: file.name
      });
      
      socketRef.current.emit('send:message', messageData);

      // Refresh conversation list to update active state and last message
      if (refreshConversations) {
        refreshConversations(); // Immediate refresh
        setTimeout(() => refreshConversations(), 500);
        setTimeout(() => refreshConversations(), 1000);
      }

      toast.success(isImage ? 'Image sent!' : 'File sent!');
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast.error(error.message || 'Failed to upload file');
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || !currentUserId) {
      return;
    }

    // Prevent double sending
    if (sendingMessageRef.current) {
      console.log('⚠️ Message already being sent, ignoring duplicate send');
      return;
    }

    // Use chatRoom.id if available, otherwise use conversationId
    const chatIdToUse = chatRoom?.id || conversationId;
    
    if (!chatIdToUse) {
      toast.error('Chat room not loaded. Please wait...');
      return;
    }

    if (!socketRef.current || !isConnected) {
      toast.error('Connection not ready. Please wait...');
      return;
    }

    const messageContent = newMessage.trim();
    setNewMessage("");
    sendingMessageRef.current = true; // Set flag to prevent double sends

    // Add optimistic message with unique ID - use timestamp + random to ensure uniqueness
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const optimisticMessage: Message = {
      id: tempId,
      content: messageContent,
      senderId: currentUserId,
      createdAt: new Date().toISOString(),
      read: false,
      type: 'TEXT'
    };

    setMessages(prev => {
      // Check if we already have a temp message with same content from current user (prevent double sends)
      const hasExistingTemp = prev.some(
        m => m.id.startsWith('temp-') && 
        m.senderId === currentUserId && 
        m.content === messageContent &&
        Math.abs(new Date(m.createdAt).getTime() - Date.now()) < 2000 // Within last 2 seconds
      );
      
      if (hasExistingTemp) {
        console.log('⚠️ Temp message already exists, preventing duplicate send');
        sendingMessageRef.current = false; // Reset flag
        return prev;
      }
      
      console.log('📝 Adding optimistic message:', tempId, messageContent.substring(0, 30));
      // Track this temp message for quick replacement
      pendingTempMessagesRef.current.set(messageContent, tempId);
      return [...prev, optimisticMessage];
    });
    // Force scroll when sending own message
    scrollToBottom(true);

    // Send via WebSocket
    const messageData = {
      chatId: chatIdToUse,
      senderId: currentUserId,
      content: messageContent,
      type: 'TEXT',
      createdAt: new Date().toISOString()
    };

    console.log('📤 Sending message:', {
      chatId: chatIdToUse,
      conversationId,
      content: messageContent.substring(0, 30)
    });
    
    socketRef.current.emit('send:message', messageData, (response: any) => {
      // Reset flag in callback to ensure it's only reset after message is sent
      sendingMessageRef.current = false;
      console.log('✅ Message sent, reset sending flag');
    });
    
    // Also reset flag after a delay as fallback (in case callback doesn't fire)
    setTimeout(() => {
      sendingMessageRef.current = false;
    }, 2000);

    // Refresh conversation list
    if (refreshConversations) {
      setTimeout(() => refreshConversations(), 500);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      // Only send if not already sending (prevent double trigger from Enter key)
      if (!sendingMessageRef.current) {
      sendMessage();
      }
    }
  };

  // Filter messages for search
  const filteredMessages = searchQuery
    ? messages.filter(msg =>
        msg.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : messages;

  const handleSearch = () => {
    setIsSearchOpen(true);
  };

  const handleCloseSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery("");
  };

  const handleVideoCall = () => {
    setIsVideoCallDialogOpen(true);
  };

  const handleCloseVideoCallDialog = () => {
    setIsVideoCallDialogOpen(false);
  };

  const handleStartVideoCall = async () => {
    try {
      const chatIdToUse = chatRoom?.id || conversationId;
      if (!chatIdToUse) {
        toast.error("Chat room not loaded");
        return;
      }

      const channelName = `chat-${chatIdToUse}`;
      const uid = currentUserId;

      const response = await apiClient.getAgoraToken(channelName, uid);
      
      if (response.success && response.data) {
        const tokenData = (response.data as any).data || response.data;
        const token = tokenData.token;
        
        localStorage.setItem('agora_token', token);
        localStorage.setItem('agora_channel', channelName);
        localStorage.setItem('agora_uid', uid);
        
        toast.success("Video call token generated!");
        handleCloseVideoCallDialog();
      } else {
        toast.error(response.error || "Failed to get video call token");
      }
    } catch (error) {
      console.error("Error starting video call:", error);
      toast.error("Failed to start video call");
    }
  };

  const handleDeleteChat = async () => {
    const chatIdToUse = chatRoom?.id || conversationId;
    if (!chatIdToUse || !currentUserId) {
      toast.error("Chat room not loaded");
      return;
    }

    if (!confirm("Are you sure you want to delete this chat? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await apiClient.deleteChat(chatIdToUse, currentUserId);
      
      if (response.success) {
        toast.success("Chat deleted successfully");
        navigate('/chat');
        if (refreshConversations) {
          refreshConversations();
        }
      } else {
        toast.error(response.error || "Failed to delete chat");
      }
    } catch (error) {
      console.error("Error deleting chat:", error);
      toast.error("Failed to delete chat");
    }
  };

  const handleArchiveChat = async () => {
    const chatIdToUse = chatRoom?.id || conversationId;
    if (!chatIdToUse || !currentUserId) {
      toast.error("Chat room not loaded");
      return;
    }

    try {
      const response = await apiClient.archiveChat(chatIdToUse, currentUserId);
      
      if (response.success) {
        toast.success("Chat archived successfully");
        if (chatRoom) {
          setChatRoom({ ...chatRoom, status: 'ARCHIVED' });
        }
        if (refreshConversations) {
          refreshConversations();
        }
      } else {
        toast.error(response.error || "Failed to archive chat");
      }
    } catch (error) {
      console.error("Error archiving chat:", error);
      toast.error("Failed to archive chat");
    }
  };

  const handleBlockUser = async () => {
    if (!currentUserId || !otherUser?.id) {
      toast.error("User information not available");
      return;
    }

    if (!confirm(`Are you sure you want to block ${otherUser.first_name || otherUser.email}?`)) {
      return;
    }

    try {
      const response = await apiClient.blockUser(currentUserId, otherUser.id);
      
      if (response.success) {
        toast.success("User blocked successfully");
        if (chatRoom) {
          setChatRoom({ ...chatRoom, status: 'FLAGGED' });
        }
        if (refreshConversations) {
          refreshConversations();
        }
      } else {
        toast.error(response.error || "Failed to block user");
      }
    } catch (error) {
      console.error("Error blocking user:", error);
      toast.error("Failed to block user");
    }
  };

  if (isLoadingChatRoom || (!chatRoom && !chatRoomLoadedRef.current)) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          {isLoadingChatRoom ? "Loading chat room..." : "Loading chat..."}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Chat Header */}
      <div className="border-b p-4 flex items-center justify-between bg-card shadow-sm">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={otherUser?.profile_pic || `https://ui-avatars.com/api/?name=${otherUser?.first_name}+${otherUser?.last_name}&background=random`} />
            <AvatarFallback>{otherUser?.first_name?.[0] || '?'}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold text-lg">
              {otherUser?.first_name && otherUser?.last_name 
                ? `${otherUser.first_name} ${otherUser.last_name}`.trim()
                : otherUser?.first_name 
                ? otherUser.first_name
                : otherUser?.email 
                ? otherUser.email.split('@')[0]
                : 'Unknown User'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isConnected ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={handleSearch}>
            <Search className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleVideoCall}>
            <Video className="h-5 w-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleArchiveChat}>
                <Archive className="mr-2 h-4 w-4" /> Archive Chat
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleBlockUser}>
                <UserX className="mr-2 h-4 w-4" /> Block User
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600" onClick={handleDeleteChat}>
                <Trash2 className="mr-2 h-4 w-4" /> Delete Chat
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Chat Messages */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 p-4 overflow-y-auto space-y-4" 
        style={{ maxHeight: 'calc(100vh - 180px)' }}
        onScroll={handleScroll}
      >
        {filteredMessages.length === 0 && !isSearchOpen ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <MessageSquare className="h-12 w-12 mb-4" />
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          filteredMessages.map((message) => {
            const isOwnMessage = message.senderId === currentUserId;
            return (
              <div
                key={message.id}
                className={cn(
                  "flex",
                  isOwnMessage ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[70%] rounded-lg px-4 py-2",
                    isOwnMessage
                      ? "bg-[#D3FC50] text-black"
                      : "bg-muted"
                  )}
                >
                  {message.type === 'IMAGE' && message.fileUrl ? (
                    <div className="space-y-2">
                      <img 
                        src={message.fileUrl} 
                        alt={message.content || 'Image'} 
                        className="max-w-full max-h-64 rounded-lg object-contain cursor-pointer"
                        onClick={() => window.open(message.fileUrl, '_blank')}
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.style.display = 'none';
                          const fallback = target.nextElementSibling as HTMLElement;
                          if (fallback) fallback.classList.remove('hidden');
                        }}
                      />
                      <p className={cn("text-sm hidden", isOwnMessage && "text-black")}>{message.content || 'Image'}</p>
                      {message.content && message.content !== '📷 Image' && (
                        <p className={cn("text-sm", isOwnMessage && "text-black")}>{message.content}</p>
                      )}
                    </div>
                  ) : message.type === 'FILE' && message.fileUrl ? (
                    <div className="space-y-2">
                      <a 
                        href={message.fileUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={cn(
                          "text-sm underline hover:opacity-80 flex items-center gap-2 break-all",
                          isOwnMessage ? "text-black" : ""
                        )}
                      >
                        <Paperclip className="w-4 h-4 flex-shrink-0" />
                        <span>{message.content || 'Download File'}</span>
                      </a>
                    </div>
                  ) : (
                    <p className={cn("text-sm", isOwnMessage && "text-black")}>{message.content}</p>
                  )}
                  <p
                    className={cn(
                      "text-xs mt-1",
                      isOwnMessage ? "text-black/70" : "text-muted-foreground"
                    )}
                  >
                    {formatChatTime(message.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Search Dialog */}
      {isSearchOpen && (
        <div className="absolute inset-0 bg-background z-50 flex flex-col">
          <div className="border-b p-4 flex items-center justify-between">
            <h3 className="font-semibold">Search Messages</h3>
            <Button variant="ghost" size="icon" onClick={handleCloseSearch}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="p-4">
            <Input
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {filteredMessages.length === 0 ? (
              <p className="text-center text-muted-foreground">No messages found</p>
            ) : (
              filteredMessages.map((message) => (
                <div key={message.id} className="p-2 border-b">
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatChatTime(message.createdAt)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="border-t p-4 bg-card">
        <div className="flex items-center space-x-2">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf,.doc,.docx,.txt"
            onChange={handleFileSelect}
            className="hidden"
            disabled={!isConnected || !chatRoom?.id || isUploading}
          />
          
          {/* File upload button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={!isConnected || !chatRoom?.id || isUploading}
            title="Upload file or image"
          >
            {isUploading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
            ) : (
              <Paperclip className="h-5 w-5" />
            )}
          </Button>
          
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              isLoadingChatRoom
                ? "Loading chat..."
                : !chatRoom?.id
                ? "Chat room not available"
                : !isConnected
                ? "Connecting..."
                : "Type a message..."
            }
            disabled={isLoadingChatRoom || !isConnected || !chatRoom?.id || isUploading}
          />
          <Button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              // Only send if not already sending (prevent double trigger from button click)
              if (!sendingMessageRef.current) {
                sendMessage();
              }
            }}
            disabled={!newMessage.trim() || !isConnected || !chatRoom?.id || isUploading || sendingMessageRef.current}
            size="icon"
            className="bg-[#D3FC50] hover:bg-[#D3FC50]/90"
          >
            <Send className="h-5 w-5 text-black" />
          </Button>
        </div>
      </div>

      {/* Video Call Dialog */}
      <Dialog open={isVideoCallDialogOpen} onOpenChange={setIsVideoCallDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start Video Call</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Start a video call with {otherUser?.first_name} {otherUser?.last_name}
            </p>
            <Button onClick={handleStartVideoCall} className="w-full">
              Start Call
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
