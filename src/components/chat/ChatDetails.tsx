import { useEffect, useState } from "react";
import { FileText, Star, Flag, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { apiClient } from "@/lib/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ChatDetailsProps {
  conversationId: string;
}

export const ChatDetails = ({ conversationId }: ChatDetailsProps) => {
  const [listing, setListing] = useState<any>(null);
  const [participants, setParticipants] = useState<any[]>([]);

  useEffect(() => {
    fetchDetails();
  }, [conversationId]);

  const fetchDetails = async () => {
    try {
      const response = await apiClient.getChatById(conversationId);
      if (response.success && response.data) {
        const chat = (response.data as any).data || response.data;
        
        if (chat) {
          // Set listing if available
          if (chat.listing) {
            setListing(chat.listing);
          }

          // Get participants from chat (user and seller)
          const buyer = chat.user;
          const seller = chat.seller;
          
          const buyerProfile = buyer ? {
            id: buyer.id,
            full_name: `${buyer.first_name || ''} ${buyer.last_name || ''}`.trim(),
            avatar_url: buyer.profile_pic,
            email: buyer.email,
          } : null;

          const sellerProfile = seller ? {
            id: seller.id,
            full_name: `${seller.first_name || ''} ${seller.last_name || ''}`.trim(),
            avatar_url: seller.profile_pic,
            email: seller.email,
          } : null;

          setParticipants([buyerProfile, sellerProfile].filter(Boolean));
        }
      }
    } catch (error) {
      console.error('Error fetching chat details:', error);
    }
  };

  if (!listing) {
    return (
      <div className="w-80 bg-background border-l p-4">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="w-80 bg-background border-l flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2">Details</h3>
        
        {/* Participants */}
        <div className="flex items-center gap-2 mb-4">
          {participants.slice(0, 3).map((participant, i) => (
            <Avatar key={participant.id} className="w-10 h-10 border-2 border-background" style={{ marginLeft: i > 0 ? '-8px' : '0' }}>
              <AvatarImage src={participant.avatar_url} />
              <AvatarFallback>{participant.full_name?.charAt(0)}</AvatarFallback>
            </Avatar>
          ))}
        </div>

        <h4 className="text-xl font-bold mb-1">{listing.title}</h4>
        <p className="text-sm text-muted-foreground mb-4">
          3 Members, 1 online
        </p>

        {/* Quick Actions */}
        <div className="space-y-2 mb-4">
          <Button variant="ghost" className="w-full justify-start gap-2">
            <FileText className="w-4 h-4" />
            Docs, Link, Media
            <span className="ml-auto text-muted-foreground">120</span>
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2">
            <Star className="w-4 h-4 text-green-500" />
            Label this chat
            <span className="ml-auto text-xs text-green-600 bg-green-50 px-2 py-1 rounded">Good</span>
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2 text-destructive">
            <Flag className="w-4 h-4" />
            Report chat
          </Button>
        </div>

        <Separator className="my-4" />

        {/* Make Offer Button */}
        <Button className="w-full bg-[#D3FC50] hover:bg-[#D3FC50]/90 text-black font-semibold rounded-full mb-4">
          <DollarSign className="w-4 h-4 mr-2" />
          Make Offer
        </Button>

        {/* Listing Information */}
        <div>
          <h5 className="font-semibold mb-3">Listing information</h5>
          
          {listing.image_url && (
            <img
              src={listing.image_url}
              alt={listing.title}
              className="w-full rounded-lg mb-3 object-cover h-40"
            />
          )}

          <h6 className="font-semibold mb-2">{listing.title}</h6>
          <p className="text-sm text-muted-foreground mb-3">
            {listing.description}
          </p>

          <div className="text-2xl font-bold mb-2">
            ${Number(listing.price).toLocaleString()}
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm mb-3">
            <div>
              <span className="text-muted-foreground">Location:</span>
              <p className="font-medium">{listing.location || 'N/A'}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Status:</span>
              <p className="font-medium capitalize">{listing.status}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
