import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Link as LinkIcon, Image as ImageIcon, ChevronRight, AlertCircle, User, Mail, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AdminChatDetailsProps {
  conversationId: string;
}

export const AdminChatDetails = ({ conversationId }: AdminChatDetailsProps) => {
  const [conversation, setConversation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDetails();
  }, [conversationId]);

  const fetchDetails = async () => {
    try {
      const response = await apiClient.getChatById(conversationId);
      
      if (!response.success) {
        console.error('Error fetching conversation details:', response.error);
        return;
      }

      setConversation(response.data);
    } catch (error) {
      console.error('Error fetching conversation details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-80 border-l p-6 bg-card">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading details...</p>
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="w-80 border-l p-6 bg-card">
        <p className="text-muted-foreground">No conversation details found</p>
      </div>
    );
  }

  const buyer = conversation.user;
  const seller = conversation.seller;
  const buyerName = `${buyer?.first_name || ''} ${buyer?.last_name || ''}`.trim() || 'Buyer';
  const sellerName = `${seller?.first_name || ''} ${seller?.last_name || ''}`.trim() || 'Seller';
  const memberCount = 3; // buyer + seller + admin
  const onlineCount = 1; // TODO: Add real-time presence
  const unreadCount = conversation.messages?.filter((msg: any) => !msg.read).length || 0;

  return (
    <div className="w-80 border-l overflow-y-auto bg-card">
      <div className="p-6">
        <h3 className="font-semibold mb-4">Details</h3>

        {/* Participants */}
        <div className="mb-6">
          <div className="flex -space-x-2 mb-2">
            {[buyer, seller].filter(Boolean).map((participant, idx) => (
              <Avatar key={idx} className="h-10 w-10 border-2 border-background">
                <AvatarImage src={participant?.profile_pic || ''} />
                <AvatarFallback>
                  {participant?.first_name?.[0] || participant?.last_name?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
          <p className="text-sm font-medium">
            Chat with {buyerName} & {sellerName}
          </p>
          <p className="text-xs text-muted-foreground">
            {memberCount} Members, {onlineCount} online
          </p>
        </div>

        {/* Chat Status */}
        <div className="mb-6">
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <span className="text-sm font-medium">Status</span>
            <Badge variant={conversation.status === 'ACTIVE' ? 'default' : 'secondary'}>
              {conversation.status}
            </Badge>
          </div>
          {unreadCount > 0 && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 mt-2">
              <span className="text-sm font-medium">Unread Messages</span>
              <Badge variant="destructive">{unreadCount}</Badge>
            </div>
          )}
        </div>

        {/* Media Section */}
        <div className="mb-6">
          <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded">
                <ImageIcon className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm font-medium">Docs, Link, Media</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {conversation.messages?.filter((msg: any) => msg.type === 'IMAGE' || msg.type === 'FILE').length || 0}
              </span>
              <ChevronRight className="h-4 w-4" />
            </div>
          </button>
        </div>

        {/* Buyer Information */}
        <div className="space-y-4 mb-6">
          <h4 className="font-semibold text-sm">Buyer Information</h4>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Avatar className="h-10 w-10">
                <AvatarImage src={buyer?.profile_pic || ''} />
                <AvatarFallback>
                  {buyer?.first_name?.[0] || buyer?.last_name?.[0] || 'B'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium text-sm">{buyerName}</p>
                <p className="text-xs text-muted-foreground">{buyer?.email}</p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-3 w-3" />
                <span>{buyer?.email || 'N/A'}</span>
              </div>
              {buyer?.phone && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-3 w-3" />
                  <span>{buyer.phone}</span>
                </div>
              )}
            </div>

            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => navigate(`/admin/users/${buyer?.id}`)}
            >
              <User className="h-4 w-4 mr-2" />
              View Buyer Profile
            </Button>
          </div>
        </div>

        {/* Seller Information */}
        <div className="space-y-4">
          <h4 className="font-semibold text-sm">Seller Information</h4>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Avatar className="h-10 w-10">
                <AvatarImage src={seller?.profile_pic || ''} />
                <AvatarFallback>
                  {seller?.first_name?.[0] || seller?.last_name?.[0] || 'S'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium text-sm">{sellerName}</p>
                <p className="text-xs text-muted-foreground">{seller?.email}</p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-3 w-3" />
                <span>{seller?.email || 'N/A'}</span>
              </div>
              {seller?.phone && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-3 w-3" />
                  <span>{seller.phone}</span>
                </div>
              )}
            </div>

            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => navigate(`/admin/users/${seller?.id}`)}
            >
              <User className="h-4 w-4 mr-2" />
              View Seller Profile
            </Button>
          </div>
        </div>

        {/* Chat Metadata */}
        <div className="mt-6 pt-6 border-t space-y-2 text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>Created:</span>
            <span>{new Date(conversation.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Last Updated:</span>
            <span>{new Date(conversation.updatedAt).toLocaleDateString()}</span>
          </div>
          {conversation.isOffered && (
            <div className="flex justify-between">
              <span>Offer Status:</span>
              <Badge variant="default" className="bg-green-500">Offered</Badge>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
