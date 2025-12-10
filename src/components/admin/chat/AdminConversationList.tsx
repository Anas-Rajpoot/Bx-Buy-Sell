import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search, SlidersHorizontal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { apiClient } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";

interface Conversation {
  id: string;
  user: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    profile_pic: string | null;
  };
  seller: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    profile_pic: string | null;
  };
  messages: Array<{
    id: string;
    content: string | null;
    createdAt: string;
    senderId: string;
    read: boolean;
  }>;
  status: string;
  updatedAt: string;
  createdAt: string;
  monitorViews?: Array<{
    monitorId: string;
    viewedAt: string;
  }>;
}

interface AdminConversationListProps {
  selectedConversationId: string | null;
  onSelectConversation: (id: string) => void;
}

export const AdminConversationList = ({ 
  selectedConversationId, 
  onSelectConversation 
}: AdminConversationListProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
    
    // Poll for updates every 5 seconds
    const interval = setInterval(() => {
      fetchConversations();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await apiClient.getAllChats();
      
      if (!response.success) {
        console.error('Error fetching conversations:', response.error);
        return;
      }

      const chats = Array.isArray(response.data) ? response.data : [];
      
      // Transform backend data to match component expectations
      const transformedConversations = chats.map((chat: Conversation) => {
        const lastMessage = chat.messages && chat.messages.length > 0 
          ? chat.messages[0] 
          : null;
        
        // Count unread messages
        const unreadCount = chat.messages 
          ? chat.messages.filter((msg: any) => !msg.read).length 
          : 0;
        
        // Check if assigned (has monitor views)
        const isAssigned = chat.monitorViews && chat.monitorViews.length > 0;

        return {
          id: chat.id,
          user: chat.user,
          seller: chat.seller,
          last_message: lastMessage?.content || null,
          last_message_at: lastMessage?.createdAt || chat.updatedAt,
          unread_count: unreadCount,
          is_assigned: isAssigned,
          status: chat.status,
          updatedAt: chat.updatedAt,
        };
      });

      // Sort by last message time
      transformedConversations.sort((a, b) => 
        new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
      );

      setConversations(transformedConversations as any);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredConversations = conversations.filter(conv => {
    const buyerName = `${conv.user?.first_name || ''} ${conv.user?.last_name || ''}`.toLowerCase();
    const sellerName = `${conv.seller?.first_name || ''} ${conv.seller?.last_name || ''}`.toLowerCase();
    const searchLower = searchQuery.toLowerCase();
    
    return (
      buyerName.includes(searchLower) ||
      sellerName.includes(searchLower) ||
      conv.user?.email?.toLowerCase().includes(searchLower) ||
      conv.seller?.email?.toLowerCase().includes(searchLower) ||
      conv.last_message?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="w-80 border-r flex flex-col bg-card">
      {/* Search */}
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by username, title, link, word, ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          <SlidersHorizontal className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-muted-foreground">Loading...</div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">No conversations found</div>
        ) : (
          filteredConversations.map((conv) => {
            const buyerName = `${conv.user?.first_name || ''} ${conv.user?.last_name || ''}`.trim() || 'Buyer';
            const sellerName = `${conv.seller?.first_name || ''} ${conv.seller?.last_name || ''}`.trim() || 'Seller';
            
            return (
              <div
                key={conv.id}
                onClick={() => onSelectConversation(conv.id)}
                className={`p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
                  selectedConversationId === conv.id ? 'bg-muted' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={conv.user?.profile_pic || ''} />
                    <AvatarFallback>
                      {buyerName[0]?.toUpperCase() || 'B'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium text-sm truncate">
                        {buyerName} ↔ {sellerName}
                      </h3>
                      <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                        {conv.last_message_at 
                          ? formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: true })
                          : 'No messages'}
                      </span>
                    </div>
                    
                    <p className="text-xs text-muted-foreground truncate mb-2">
                      {conv.last_message || 'No messages yet'}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <Badge 
                        variant={conv.is_assigned ? "default" : "destructive"}
                        className={conv.is_assigned ? "bg-green-500" : ""}
                      >
                        {conv.is_assigned ? 'Assigned' : 'Unassigned'}
                      </Badge>
                      
                      {conv.unread_count > 0 && (
                        <div className="h-5 w-5 rounded-full bg-destructive text-white text-xs flex items-center justify-center">
                          {conv.unread_count}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
