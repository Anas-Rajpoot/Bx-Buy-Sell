import { useEffect, useState, useRef } from "react";
import { Search, Archive, MoreVertical, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { apiClient } from "@/lib/api";
import { formatChatTime } from "@/lib/timeFormatter";
import { cn } from "@/lib/utils";
import { createSocketConnection, getWebSocketUrl } from "@/lib/socket";
import { Socket } from "socket.io-client";
import { toast } from "sonner";

interface ChatRoom {
  id: string;
  userId: string;
  sellerId: string;
  isOffered: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
  messages?: Array<{
    id: string;
    content: string;
    senderId: string;
    read: boolean;
    createdAt: string;
  }>;
}

interface Conversation {
  id: string;
  userId: string;
  sellerId: string;
  listingId?: string | null; // CRITICAL: Include listingId to scope chats to specific listings
  otherUserId: string;
  otherUserName: string;
  otherUserAvatar?: string;
  lastMessage?: string;
  lastMessageAt: string;
  unreadCount: number;
  isArchived: boolean;
}

interface ConversationListProps {
  selectedConversation: string | null;
  onSelectConversation: (id: string, userId: string, sellerId: string) => void;
  userId: string;
  refreshTrigger?: string | null; // Trigger refresh when conversation changes
  onConversationDeleted?: () => void; // Callback when conversation is deleted
}

export const ConversationList = ({ selectedConversation, onSelectConversation, userId, refreshTrigger, onConversationDeleted }: ConversationListProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    fetchConversations();
    
    // Set up WebSocket connection for real-time updates
    // NOTE: ConversationList socket does NOT join any rooms - it only listens for updates
    const wsUrl = getWebSocketUrl();
    console.log('🔌 ConversationList: Connecting to Socket.IO for real-time updates:', wsUrl);
    
    const socket = createSocketConnection({
      transports: ['websocket', 'polling'],
      reconnection: true,
    });
    
    socketRef.current = socket;
    
    socket.on('connect', () => {
      console.log('✅ ConversationList: Socket.IO connected for real-time updates');
      // CRITICAL: Do NOT join any rooms here - ConversationList should not receive messages
      // It only listens for message events to trigger conversation list refresh
    });
    
    // Listen for new messages to update conversation list in real-time
    // NOTE: This socket is NOT in any room, so it receives ALL messages
    // We use this to refresh the conversation list when ANY message is sent
    socket.on('message', (data: string) => {
      try {
        const message = typeof data === 'string' ? JSON.parse(data) : data;
        console.log('📨 ConversationList: Received message event, refreshing list:', message.chatId);
        // Refresh conversation list when a new message arrives
        // Use debounce to avoid too many refreshes
        setTimeout(() => {
          fetchConversations();
        }, 500);
      } catch (error) {
        console.error('Error parsing message in ConversationList:', error);
      }
    });
    
    socket.on('message:recieve', (data: string) => {
      try {
        const message = typeof data === 'string' ? JSON.parse(data) : data;
        console.log('📨 ConversationList: Received message:recieve event, refreshing list:', message.chatId);
        // Refresh conversation list when a new message arrives
        setTimeout(() => {
          fetchConversations();
        }, 500);
      } catch (error) {
        console.error('Error parsing message:recieve in ConversationList:', error);
      }
    });
    
    // Poll for new messages every 15 seconds as fallback
    const interval = setInterval(() => {
      fetchConversations();
    }, 15000);

    return () => {
      clearInterval(interval);
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [userId]);

  // Refresh conversations when selected conversation changes (to update unread counts after marking as read)
  useEffect(() => {
    if (refreshTrigger) {
      console.log('🔄 Refresh trigger changed, refreshing conversations:', refreshTrigger);
      // Multiple refreshes to ensure unread counts update properly
      const timer1 = setTimeout(() => {
        fetchConversations();
      }, 800); // First refresh
      
      const timer2 = setTimeout(() => {
        fetchConversations();
      }, 2000); // Second refresh after mark-read should complete
      
      const timer3 = setTimeout(() => {
        fetchConversations();
      }, 4000); // Third refresh to catch any delayed updates
      
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [refreshTrigger, selectedConversation]);

  const fetchConversations = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      // Get chat rooms where user is buyer
      const buyerResponse = await apiClient.getChatRoomsByUserId(userId);
      // Get chat rooms where user is seller
      const sellerResponse = await apiClient.getChatRoomsBySellerId(userId);

      const buyerRooms: ChatRoom[] = buyerResponse.success && Array.isArray(buyerResponse.data) 
        ? buyerResponse.data 
        : [];
      const sellerRooms: ChatRoom[] = sellerResponse.success && Array.isArray(sellerResponse.data) 
        ? sellerResponse.data 
        : [];

      // Combine and deduplicate by room ID first
      const allRooms = [...buyerRooms, ...sellerRooms];
      const uniqueRoomsById = allRooms.filter((room, index, self) => 
        index === self.findIndex(r => r.id === room.id)
      );
      
      // CRITICAL: Merge all chats with the same seller into ONE conversation
      // Group by user pair ONLY (ignore listingId) - one conversation per seller
      const roomsBySeller = new Map<string, ChatRoom>();
      
      uniqueRoomsById.forEach(room => {
        // Create a normalized key based on user pair ONLY (not listingId)
        // Sort userId and sellerId to handle both directions (user is buyer or seller)
        // CRITICAL: Use sorted IDs to ensure same pair regardless of which is buyer/seller
        const sortedIds = [room.userId, room.sellerId].sort();
        const userPair = sortedIds.join('-');
        
        console.log(`Merging room ${room.id}: userId=${room.userId}, sellerId=${room.sellerId}, pair=${userPair}`);
        
        // If we already have a room with this seller, keep the one with the most recent updatedAt
        const existing = roomsBySeller.get(userPair);
        if (!existing || new Date(room.updatedAt || room.createdAt || 0) > new Date(existing.updatedAt || existing.createdAt || 0)) {
          roomsBySeller.set(userPair, room);
          console.log(`  → Selected room ${room.id} (updatedAt: ${room.updatedAt})`);
        } else {
          console.log(`  → Skipped room ${room.id} (older than ${existing.id})`);
        }
      });
      
      const uniqueRooms = Array.from(roomsBySeller.values());
      
      console.log(`✅ Final deduplication: ${uniqueRoomsById.length} rooms → ${uniqueRooms.length} unique conversations`);
      
      console.log('📊 Conversation deduplication:', {
        total: allRooms.length,
        afterIdDedup: uniqueRoomsById.length,
        afterPairDedup: uniqueRooms.length,
        duplicatesRemoved: allRooms.length - uniqueRooms.length,
        roomsBySellerKeys: Array.from(roomsBySeller.keys()),
        uniqueRoomsCount: uniqueRooms.length
      });
      
      // DEBUG: Log which rooms are being grouped
      uniqueRoomsById.forEach(room => {
        const userPair = [room.userId, room.sellerId].sort().join('-');
        console.log(`  Room ${room.id}: userId=${room.userId}, sellerId=${room.sellerId}, pair=${userPair}`);
      });

      // Fetch details for each conversation
      const conversationsWithDetails = await Promise.all(
        uniqueRooms.map(async (room) => {
          const otherUserId = room.userId === userId ? room.sellerId : room.userId;
          
          // Get other user details
          const userResponse = await apiClient.getUserById(otherUserId);
          const otherUser = userResponse.success && userResponse.data 
            ? userResponse.data 
            : null;

          const firstName = otherUser?.first_name || '';
          const lastName = otherUser?.last_name || '';
          const fullName = `${firstName} ${lastName}`.trim() || otherUser?.email || 'Unknown User';

          // Get ALL messages from ALL chat rooms with this seller (merged)
          const chatResponse = await apiClient.getChatRoom(room.userId, room.sellerId);

          let lastMessage = '';
          let lastMessageAt = room.updatedAt;
          let unreadCount = 0;

          // Extract messages - handle both wrapped and direct responses
          const chatData = chatResponse.data?.data || chatResponse.data;
          const messages = chatResponse.success && chatData?.messages
            ? (Array.isArray(chatData.messages) ? chatData.messages : [])
            : [];
            
          if (messages.length > 0) {
            // Sort by creation date (most recent first)
            const sortedMessages = [...messages].sort((a, b) => 
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            
            // Get last message (most recent)
            const lastMsg = sortedMessages[0];
            lastMessage = lastMsg?.content || '';
            lastMessageAt = lastMsg?.createdAt || room.updatedAt;
            
            // Count ALL unread messages across ALL chats with this seller
            // CRITICAL: Always set unread to 0 if this conversation is currently selected (user is viewing it)
            const isSelected = selectedConversation === room.id || selectedConversation === chatData?.id;
            
            if (isSelected) {
              // Force unread count to 0 for selected conversation
              unreadCount = 0;
              console.log(`  ✅ Conversation with ${fullName} is SELECTED - forcing unread count to 0`);
            } else {
              // Only count messages that are explicitly unread (false, null, or undefined)
              unreadCount = messages.filter(msg => 
                msg.senderId !== userId && 
                (msg.read === false || msg.read === null || msg.read === undefined)
              ).length;
            }
            
            console.log(`  Conversation with ${fullName}: ${messages.length} total messages, ${unreadCount} unread (selected: ${isSelected}, roomId: ${room.id}, selectedId: ${selectedConversation})`);
          } else {
            console.log(`  Conversation with ${fullName}: No messages`);
            unreadCount = 0; // No messages = no unread
          }

          return {
            id: room.id, // Use the most recent chat room's ID as the conversation ID
            userId: room.userId,
            sellerId: room.sellerId,
            listingId: null, // Not used - merged conversation
            otherUserId,
            otherUserName: fullName,
            otherUserAvatar: otherUser?.profile_pic,
            lastMessage,
            lastMessageAt,
            unreadCount,
            isArchived: room.status === 'ARCHIVED',
          };
        })
      );

      // Sort by last message time
      conversationsWithDetails.sort((a, b) => 
        new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
      );

      setConversations(conversationsWithDetails);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredConversations = conversations.filter(convo => 
    convo.isArchived === showArchived &&
    (convo.otherUserName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading && conversations.length === 0) {
    return (
      <div className="w-80 bg-background border-r flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground text-sm">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-background border-r flex flex-col h-full">
      {/* Search */}
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-full"
          />
        </div>
      </div>

      {/* Archived Chats Toggle */}
      <Button
        variant="ghost"
        onClick={() => setShowArchived(!showArchived)}
        className="mx-4 mt-2 justify-start gap-2 text-muted-foreground hover:text-foreground"
      >
        <Archive className="w-4 h-4" />
        <span className="flex-1 text-left">Archived Chats</span>
        <Badge variant="secondary" className="rounded-full">
          {conversations.filter(c => c.isArchived).length}
        </Badge>
      </Button>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.map((convo) => (
          <div
            key={convo.id}
            className={cn(
              "w-full p-4 flex items-start gap-3 hover:bg-muted/50 transition-colors border-b group relative",
              selectedConversation === convo.id && "bg-[#D3FC50] text-black"
            )}
          >
            <button
              onClick={() => {
                // Don't pass listingId when selecting - use the merged conversation
                onSelectConversation(convo.id, convo.userId, convo.sellerId);
              }}
              className="flex items-start gap-3 flex-1 text-left"
            >
              <Avatar className="w-12 h-12">
                <AvatarImage src={convo.otherUserAvatar} />
                <AvatarFallback>
                  {convo.otherUserName.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-1">
                  <h4 className={cn(
                    "font-semibold text-sm truncate",
                    selectedConversation === convo.id && "text-black"
                  )}>
                    {convo.otherUserName}
                  </h4>
                  <span className={cn(
                    "text-xs whitespace-nowrap ml-2",
                    selectedConversation === convo.id ? "text-black/70" : "text-muted-foreground"
                  )}>
                    {formatChatTime(convo.lastMessageAt)}
                  </span>
                </div>
                <p className={cn(
                  "text-xs truncate mb-1",
                  selectedConversation === convo.id ? "text-black/70" : "text-muted-foreground"
                )}>
                  {convo.lastMessage || 'No messages yet'}
                </p>
                {/* Only show unread badge if conversation is NOT selected - force 0 if selected */}
                {convo.unreadCount > 0 && selectedConversation !== convo.id && (
                  <Badge variant="destructive" className="rounded-full h-5 px-2 text-xs">
                    {convo.unreadCount}
                  </Badge>
                )}
              </div>
            </button>
            
            {/* Three dots menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity",
                    selectedConversation === convo.id && "opacity-100"
                  )}
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (!confirm(`Are you sure you want to ${convo.isArchived ? 'unarchive' : 'archive'} this conversation?`)) {
                      return;
                    }
                    try {
                      const response = convo.isArchived
                        ? await apiClient.unarchiveChat(convo.id, userId)
                        : await apiClient.archiveChat(convo.id, userId);
                      
                      if (response.success) {
                        toast.success(`Conversation ${convo.isArchived ? 'unarchived' : 'archived'} successfully`);
                        fetchConversations();
                      } else {
                        toast.error(response.error || 'Failed to archive conversation');
                      }
                    } catch (error: any) {
                      toast.error(error.message || 'Failed to archive conversation');
                    }
                  }}
                >
                  <Archive className="h-4 w-4 mr-2" />
                  {convo.isArchived ? 'Unarchive' : 'Archive'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (!confirm('Are you sure you want to delete this conversation? This action cannot be undone.')) {
                      return;
                    }
                    try {
                      const response = await apiClient.deleteChat(convo.id, userId);
                      
                      if (response.success) {
                        toast.success('Conversation deleted successfully');
                        fetchConversations();
                        if (onConversationDeleted) {
                          onConversationDeleted();
                        }
                      } else {
                        toast.error(response.error || 'Failed to delete conversation');
                      }
                    } catch (error: any) {
                      toast.error(error.message || 'Failed to delete conversation');
                    }
                  }}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}

        {filteredConversations.length === 0 && !loading && (
          <div className="p-8 text-center text-muted-foreground">
            <p>No conversations yet</p>
          </div>
        )}
      </div>
    </div>
  );
};
