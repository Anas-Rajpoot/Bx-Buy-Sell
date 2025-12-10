import { Heart, Share2, MessageSquare } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import FlagIcon from "./FlagIcon";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";

interface ListingCardProps {
  image: string;
  category: string;
  name: string;
  description: string;
  price: string;
  profitMultiple?: string;
  revenueMultiple?: string;
  location: string;
  locationFlag?: string;
  businessAge?: number;
  netProfit?: string;
  revenue?: string;
  managedByEx?: boolean;
  listingId?: string;
  sellerId?: string;
}

const ListingCard = ({
  image,
  category,
  name,
  description,
  price,
  profitMultiple = "Multiple 1.5x Profit",
  revenueMultiple = "0.5x Revenue",
  location,
  locationFlag,
  businessAge = 3,
  netProfit = "N/A",
  revenue = "N/A",
  managedByEx = false,
  listingId,
  sellerId,
}: ListingCardProps) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isStartingChat, setIsStartingChat] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // Check if listing is already favorited on mount
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!user || !listingId) return;
      
      try {
        const response = await apiClient.getFavorites();
        if (response.success && response.data) {
          const favorites = Array.isArray(response.data) ? response.data : [];
          const isFavorited = favorites.some((fav: any) => 
            fav.listingId === listingId || fav.listing?.id === listingId || fav.id === listingId
          );
          setIsFavorite(isFavorited);
        }
      } catch (error) {
        console.error('Error checking favorite status:', error);
      }
    };

    checkFavoriteStatus();
  }, [user, listingId]);

  const handleFavorite = async () => {
    if (!isAuthenticated || !user) {
      toast.error("Please log in to add favorites");
      navigate("/login");
      return;
    }

    if (!listingId) {
      toast.error("Listing ID not available");
      return;
    }

    setIsTogglingFavorite(true);
    try {
      if (isFavorite) {
        // Remove from favorites
        const response = await apiClient.removeFavorite(listingId);
        if (response.success) {
          setIsFavorite(false);
          toast.success("Removed from favorites");
          // Invalidate favorites query to refresh the count
          queryClient.invalidateQueries({ queryKey: ["user-favorites"] });
        } else {
          throw new Error(response.error || "Failed to remove favorite");
        }
      } else {
        // Add to favorites
        const response = await apiClient.addFavorite(listingId);
        if (response.success) {
          setIsFavorite(true);
          toast.success("Added to favorites");
          // Invalidate favorites query to refresh the count
          queryClient.invalidateQueries({ queryKey: ["user-favorites"] });
        } else {
          throw new Error(response.error || "Failed to add favorite");
        }
      }
    } catch (error: any) {
      console.error("Error toggling favorite:", error);
      toast.error(error.message || "Failed to update favorite");
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  const handleShare = async () => {
    const listingUrl = listingId 
      ? `${window.location.origin}/listing/${listingId}`
      : window.location.href;
    
    const shareData = {
      title: name || "Business Listing",
      text: description || `Check out this business listing: ${name}`,
      url: listingUrl,
    };

    // Try native share API first (mobile/desktop with share support)
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        toast.success("Shared successfully");
      } catch (err: any) {
        // User canceled or error occurred
        if (err.name !== "AbortError") {
          console.error("Share error:", err);
          // Fallback to clipboard
          await navigator.clipboard.writeText(listingUrl);
          toast.success("Link copied to clipboard");
        }
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(listingUrl);
        toast.success("Link copied to clipboard!");
      } catch (err) {
        console.error("Failed to copy to clipboard:", err);
        toast.error("Failed to copy link. Please copy manually.");
      }
    }
  };

  const handleContactSeller = async () => {
    if (!user) {
      toast.error("Please log in to contact the seller");
      navigate("/login");
      return;
    }

    if (!sellerId) {
      toast.error("Seller information not available");
      return;
    }

    if (!listingId) {
      toast.error("Listing information not available");
      return;
    }

    setIsStartingChat(true);
    try {
      // CRITICAL: Find or create chat room with this seller (merged conversation, not listing-specific)
      console.log('📞 Contacting seller:', { sellerId, buyerId: user.id });
      
      // Try to get existing chat room with this seller (ignore listingId - merge all chats)
      let chatResponse = await apiClient.getChatRoom(user.id, sellerId);
      
      let chatId: string;
      
      // Extract chat data - handle both wrapped and direct responses
      const chatData = chatResponse.data?.data || chatResponse.data;
      
      if (chatResponse.success && chatData && chatData.id) {
        // Chat room exists with this seller
        chatId = chatData.id;
        console.log('✅ Found existing chat room with seller:', { chatId, sellerId });
      } else {
        // Create new chat room (will be merged in conversation list)
        console.log('🆕 Creating new chat room with seller:', sellerId);
        const createResponse = await apiClient.createChatRoom(user.id, sellerId, listingId);
        
        // Extract create response data
        const createData = createResponse.data?.data || createResponse.data;
        
        if (!createResponse.success || !createData?.id) {
          // If creation fails, try to get it again
          console.log('⚠️ Creation failed, trying to get chat room again...');
          chatResponse = await apiClient.getChatRoom(user.id, sellerId);
          const retryChatData = chatResponse.data?.data || chatResponse.data;
          
          if (chatResponse.success && retryChatData && retryChatData.id) {
            chatId = retryChatData.id;
            console.log('✅ Found chat room on retry:', { chatId, sellerId });
          } else {
            throw new Error(createResponse.error || "Failed to create chat room");
          }
        } else {
          chatId = createData.id;
          console.log('✅ Created new chat room:', { chatId, sellerId });
        }
      }

      // Navigate to chat page - no listingId in URL (merged conversation)
      navigate(`/chat?chatId=${chatId}&userId=${user.id}&sellerId=${sellerId}`);
      toast.success("Opening chat...");
    } catch (error: any) {
      console.error("Error starting chat:", error);
      toast.error(error.message || "Failed to start chat. Please try again.");
    } finally {
      setIsStartingChat(false);
    }
  };

  return (
    <div className="group bg-card rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-border">
      <div className="relative h-56 overflow-hidden bg-muted rounded-t-3xl">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <button 
            onClick={handleFavorite}
            disabled={isTogglingFavorite || !listingId}
            className="w-10 h-10 bg-background rounded-full flex items-center justify-center transition-colors shadow-lg hover:bg-background/80 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            {isTogglingFavorite ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-foreground"></div>
            ) : (
              <Heart className={`w-5 h-5 transition-colors ${isFavorite ? "fill-destructive text-destructive" : "text-foreground"}`} />
            )}
          </button>
          <button 
            onClick={handleShare}
            className="w-10 h-10 bg-background rounded-full flex items-center justify-center transition-colors shadow-lg hover:bg-background/80"
            aria-label="Share listing"
          >
            <Share2 className="w-5 h-5 text-foreground" />
          </button>
        </div>
        <div className="absolute bottom-4 left-4 flex gap-2">
          {managedByEx ? (
            <Link to="/managed-by-ex">
              <Badge variant="accent" className="font-semibold border-0 shadow-lg px-4 py-2 text-sm cursor-pointer hover:opacity-90 transition-opacity">
                <div className="w-4 h-4 border-2 border-accent-foreground rounded-full mr-2 flex items-center justify-center text-[9px] font-bold">
                  EX
                </div>
                Managed by EX
              </Badge>
            </Link>
          ) : (
            <Link to={`/category/${category.toLowerCase().replace(/\s+/g, '-')}`}>
              <Badge variant="dark" className="border-0 shadow-lg px-4 py-2 text-sm cursor-pointer hover:opacity-90 transition-opacity">
                {category}
              </Badge>
            </Link>
          )}
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="text-2xl font-bold mb-2 text-foreground">{name}</h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
          {description}
        </p>
        
        <div className="flex items-center gap-2 mb-5 flex-wrap">
          <span className="text-3xl font-bold text-foreground">{price}</span>
          <Badge variant="outline" className="text-xs font-normal border-border">
            {profitMultiple}
          </Badge>
          <Badge variant="outline" className="text-xs font-normal border-border">
            {revenueMultiple}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-5 text-sm">
          <div className="flex items-center gap-2">
            <FlagIcon country={location} className="w-5 h-4" />
            <span className="text-muted-foreground">Location:</span>
            <span className="font-semibold text-foreground">{location}</span>
          </div>
          <div className="text-right">
            <span className="text-muted-foreground">Business Age:</span>
            <span className="font-semibold text-foreground ml-1">{businessAge}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6 text-sm pb-6 border-b border-border">
          <div>
            <div className="text-muted-foreground mb-1.5">Net Profit:</div>
            <div className="font-bold text-foreground">{netProfit}</div>
          </div>
          <div className="text-right">
            <div className="text-muted-foreground mb-1.5">Revenue:</div>
            <div className="font-bold text-foreground">{revenue}</div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="flex-1 rounded-full border-2 border-foreground text-foreground hover:bg-foreground hover:text-background font-semibold"
            onClick={handleContactSeller}
            disabled={isStartingChat || !sellerId}
          >
            {isStartingChat ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-foreground mr-2"></div>
                Starting...
              </>
            ) : (
              <>
                <MessageSquare className="w-4 h-4 mr-2" />
                Contact Seller
              </>
            )}
          </Button>
          <Button 
            variant="accent" 
            className="flex-1 rounded-full font-semibold"
            onClick={() => listingId && navigate(`/listing/${listingId}`)}
          >
            View Listing
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ListingCard;
