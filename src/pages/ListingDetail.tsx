import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Heart, Share2, MessageSquare, ArrowLeft, Globe, MapPin, DollarSign, TrendingUp, Users, Calendar, Download, FileText } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

// Helper function to extract answer from question array by question text
const getAnswerByQuestion = (questions: any[], searchText: string | string[]): string | null => {
  if (!questions || !Array.isArray(questions)) return null;
  
  const searchTerms = Array.isArray(searchText) ? searchText : [searchText];
  
  for (const question of questions) {
    const questionText = (question.question || '').toLowerCase();
    if (searchTerms.some(term => questionText.includes(term.toLowerCase()))) {
      return question.answer || null;
    }
  }
  return null;
};

// Helper function to get all answers from question array
const getAllAnswers = (questions: any[]): Record<string, string> => {
  if (!questions || !Array.isArray(questions)) return {};
  
  const result: Record<string, string> = {};
  questions.forEach(q => {
    if (q.question && q.answer) {
      result[q.question] = q.answer;
    }
  });
  return result;
};

const ListingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const [isStartingChat, setIsStartingChat] = useState(false);

  const { data: listing, isLoading, error } = useQuery({
    queryKey: ["listing", id],
    queryFn: async () => {
      if (!id) throw new Error("Listing ID is required");
      
      const listingResponse = await apiClient.getListingById(id);
      
      if (!listingResponse.success) {
        throw new Error(listingResponse.error || 'Failed to fetch listing');
      }
      
      const listingData = listingResponse.data;
      
      // Extract title from brand questions
      let title = 'Untitled Listing';
      if (listingData.brand && Array.isArray(listingData.brand) && listingData.brand.length > 0) {
        const businessNameQuestion = listingData.brand.find((b: any) => 
          b.question?.toLowerCase().includes('business') || 
          b.question?.toLowerCase().includes('name') ||
          b.question?.toLowerCase().includes('company') ||
          b.question?.toLowerCase().includes('brand')
        );
        if (businessNameQuestion?.answer) {
          title = businessNameQuestion.answer;
        } else if (listingData.brand[0]?.answer) {
          title = listingData.brand[0].answer;
        }
      }
      
      // Normalize status
      let normalizedStatus = listingData.status?.toLowerCase() || 'draft';
      if (normalizedStatus === 'publish') normalizedStatus = 'published';
      
      // Get category info
      const categoryInfo = Array.isArray(listingData.category) && listingData.category.length > 0 
        ? listingData.category[0] 
        : listingData.category || null;
      
      // Fetch user profile
      let profile = null;
      if (listingData.user_id || listingData.userId) {
        try {
          const userResponse = await apiClient.getUserById(listingData.user_id || listingData.userId);
          if (userResponse.success && userResponse.data) {
            const user = userResponse.data;
            profile = {
              id: user.id,
              full_name: user.first_name && user.last_name 
                ? `${user.first_name} ${user.last_name}`.trim()
                : user.first_name || user.last_name || null,
              avatar_url: user.profile_pic || null,
            };
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      }
      
      return {
        ...listingData,
        id: listingData.id,
        title: title,
        status: normalizedStatus,
        created_at: listingData.created_at || listingData.createdAt || new Date().toISOString(),
        updated_at: listingData.updated_at || listingData.updatedAt || new Date().toISOString(),
        user_id: listingData.user_id || listingData.userId || null,
        category: categoryInfo ? [categoryInfo] : [],
        profile: profile,
      };
    },
    enabled: !!id,
  });

  const formatPrice = (price: number | string | undefined) => {
    if (!price) return "$0";
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(numPrice)) return "$0";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(numPrice);
  };

  // Extract data from question arrays
  const brandInfo = listing?.brand?.[0] || {};
  const brandAnswers = getAllAnswers(listing?.brand || []);
  const statisticsAnswers = getAllAnswers(listing?.statistics || []);
  const managementAnswers = getAllAnswers(listing?.managementQuestion || []);
  const productAnswers = getAllAnswers(listing?.productQuestion || []);
  const handoverAnswers = getAllAnswers(listing?.handover || []);
  const advertisementAnswers = getAllAnswers(listing?.advertisement || []);
  const socialAccounts = listing?.social_account || [];

  // Extract specific values
  const businessName = getAnswerByQuestion(listing?.brand || [], ['business name', 'company name', 'brand name']) || 
                      brandInfo?.answer || listing?.title || 'Untitled Listing';
  const businessDescription = getAnswerByQuestion(listing?.brand || [], ['description', 'about', 'business description']) ||
                             advertisementAnswers['Description'] || advertisementAnswers['description'] || 
                             'No description available';
  const location = getAnswerByQuestion(listing?.brand || [], ['country', 'location', 'address']) || 
                  brandInfo?.country || 'Not specified';
  const askingPrice = getAnswerByQuestion(listing?.brand || [], ['asking price', 'price', 'selling price']) || 
                     brandInfo?.askingPrice || '0';
  
  // Advertisement fields
  const intro = advertisementAnswers['Intro'] || advertisementAnswers['intro'] || '';
  const usp = advertisementAnswers['USP'] || advertisementAnswers['usp'] || '';
  const adDescription = advertisementAnswers['Description'] || advertisementAnswers['description'] || businessDescription;
  const adTitle = advertisementAnswers['Title'] || advertisementAnswers['title'] || businessName;
  const photo = listing?.advertisement?.find((a: any) => 
    a.question?.toLowerCase().includes('photo') || a.answer_type === 'PHOTO'
  )?.answer || brandInfo?.businessPhoto?.[0] || brandInfo?.logo || listing?.image_url || '/placeholder.svg';
  const attachments = listing?.advertisement?.find((a: any) => 
    a.question?.toLowerCase().includes('attachment') || a.answer_type === 'FILE'
  )?.answer || [];

  // Statistics
  const conversionRate = getAnswerByQuestion(listing?.statistics || [], ['conversion rate', 'conversion']) || 'N/A';
  const refundRate = getAnswerByQuestion(listing?.statistics || [], ['refund rate', 'refund']) || 'N/A';
  const returningCustomers = getAnswerByQuestion(listing?.statistics || [], ['returning customer', 'returning', 'repeat']) || 'N/A';
  const emailSubscribers = getAnswerByQuestion(listing?.statistics || [], ['email subscriber', 'subscriber', 'email']) || 'N/A';
  const avgOrderValue = getAnswerByQuestion(listing?.statistics || [], ['average order', 'aov', 'order value']) || 'N/A';
  const customerBase = getAnswerByQuestion(listing?.statistics || [], ['customer base', 'total customer', 'customers']) || 'N/A';

  // Management
  const teamMembers = getAnswerByQuestion(listing?.managementQuestion || [], ['team member', 'employee', 'staff']) || 'N/A';
  const timeCommitment = getAnswerByQuestion(listing?.managementQuestion || [], ['time commitment', 'hours per week']) || 'N/A';
  const cooCommitment = getAnswerByQuestion(listing?.managementQuestion || [], ['coo', 'ceo commitment', 'owner time']) || 'N/A';

  // Products
  const numProducts = getAnswerByQuestion(listing?.productQuestion || [], ['number of product', 'product count', 'products']) || 'N/A';
  const sellingModel = getAnswerByQuestion(listing?.productQuestion || [], ['selling model', 'model', 'dropshipping']) || 'N/A';
  const hasInventory = getAnswerByQuestion(listing?.productQuestion || [], ['inventory', 'stock', 'has inventory']) || 'N/A';
  const inventoryValue = getAnswerByQuestion(listing?.productQuestion || [], ['inventory value', 'stock value', 'how much']) || 'N/A';
  const inventoryIncluded = getAnswerByQuestion(listing?.productQuestion || [], ['included in price', 'inventory included']) || 'N/A';

  // Handover
  const assetsIncluded = listing?.handover?.filter((h: any) => 
    h.question?.toLowerCase().includes('asset') || h.answer?.toLowerCase().includes('yes')
  ).map((h: any) => h.answer || h.question).join(', ') || 'N/A';
  const buyerSalesLength = getAnswerByQuestion(listing?.handover || [], ['length of buyer', 'sales length', 'transfer period']) || 'N/A';
  const sellerWillHire = getAnswerByQuestion(listing?.handover || [], ['seller will hire', 'will hire', 'hire']) || 'N/A';
  const timeCommitmentFrom = getAnswerByQuestion(listing?.handover || [], ['time commitment', 'support duration', 'months']) || 'N/A';
  const postSalesSupport = getAnswerByQuestion(listing?.handover || [], ['post sale', 'post purchase', 'support']) || 'N/A';
  const supportDuration = getAnswerByQuestion(listing?.handover || [], ['support duration', 'support period', 'months']) || 'N/A';

  // Financials
  const financials = listing?.financials || [];
  const monthlyFinancials = financials.filter((f: any) => f.type === 'monthly');
  const yearlyFinancials = financials.filter((f: any) => f.type === 'yearly');
  
  // Calculate totals
  const totalRevenue = financials.reduce((sum: number, f: any) => sum + parseFloat(f.revenue_amount || 0), 0);
  const totalCost = financials.reduce((sum: number, f: any) => sum + parseFloat(f.annual_cost || 0), 0);
  const totalProfit = financials.reduce((sum: number, f: any) => sum + parseFloat(f.net_profit || 0), 0);
  const avgMonthlyProfit = monthlyFinancials.length > 0 
    ? monthlyFinancials.reduce((sum: number, f: any) => sum + parseFloat(f.net_profit || 0), 0) / monthlyFinancials.length 
    : 0;

  // Tools
  const tools = listing?.tools || [];

  // Check if listing is favorited
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!user || !id) return;
      
      try {
        const response = await apiClient.getFavorites();
        if (response.success && response.data) {
          const favorites = Array.isArray(response.data) ? response.data : [];
          const isFavorited = favorites.some((fav: any) => 
            fav.listingId === id || fav.listing?.id === id || fav.id === id
          );
          setIsFavorite(isFavorited);
        }
      } catch (error) {
        console.error('Error checking favorite status:', error);
      }
    };

    if (isAuthenticated && user) {
      checkFavoriteStatus();
    }
  }, [user, id, isAuthenticated]);

  const handleFavorite = async () => {
    if (!isAuthenticated || !user) {
      toast.error("Please log in to add favorites");
      navigate("/login");
      return;
    }

    if (!id) {
      toast.error("Listing ID not available");
      return;
    }

    setIsTogglingFavorite(true);
    try {
      if (isFavorite) {
        const response = await apiClient.removeFavorite(id);
        if (response.success) {
          setIsFavorite(false);
          toast.success("Removed from favorites");
          queryClient.invalidateQueries({ queryKey: ["user-favorites"] });
        } else {
          throw new Error(response.error || "Failed to remove favorite");
        }
      } else {
        const response = await apiClient.addFavorite(id);
        if (response.success) {
          setIsFavorite(true);
          toast.success("Added to favorites");
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
    const listingUrl = `${window.location.origin}/listing/${id}`;
    const shareData = {
      title: businessName,
      text: businessDescription,
      url: listingUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        toast.success("Shared successfully");
      } catch (err: any) {
        if (err.name !== "AbortError") {
          await navigator.clipboard.writeText(listingUrl);
          toast.success("Link copied to clipboard");
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(listingUrl);
        toast.success("Link copied to clipboard!");
      } catch (err) {
        toast.error("Failed to copy link");
      }
    }
  };

  const handleContactSeller = async () => {
    if (!user) {
      toast.error("Please log in to contact the seller");
      navigate("/login");
      return;
    }

    if (!listing?.userId && !listing?.user_id) {
      toast.error("Seller information not available");
      return;
    }

    if (!listing?.id) {
      toast.error("Listing information not available");
      return;
    }

    setIsStartingChat(true);
    try {
      const sellerId = listing.userId || listing.user_id;
      const listingId = listing.id; // CRITICAL: Use listing ID to scope chat to this specific listing
      
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh] pt-24">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading listing...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh] pt-24">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Listing Not Found</h1>
            <p className="text-muted-foreground mb-6">The listing you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => navigate("/")} className="rounded-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const categoryInfo = listing.category?.[0];
  const imageUrl = photo || listing.image_url || '/placeholder.svg';

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-6 text-accent hover:text-accent"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>

          <div className="grid grid-cols-3 gap-6">
            {/* Left Column - Main Info */}
            <div className="col-span-2 space-y-6">
              {/* Header Card */}
              <Card className="p-6 bg-card border-border">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <Badge className="bg-accent/20 text-accent border-accent/30 mb-2">
                      {categoryInfo?.name || "All Listings"}
                    </Badge>
                    <h2 className="text-2xl font-bold mb-2">{businessName}</h2>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Globe className="h-4 w-4" />
                        {location}
                      </span>
                      <span>•</span>
                      <span>{getAnswerByQuestion(listing.brand || [], ['business age', 'age', 'years']) || 'N/A'}</span>
                      <span>•</span>
                      <span>{avgMonthlyProfit > 0 ? `$${Math.round(avgMonthlyProfit).toLocaleString()}/m` : 'N/A'}</span>
                    </div>
                  </div>
                  {listing.managed_by_ex && (
                    <Badge className="bg-accent/90 text-black border-0">
                      Managed by EX
                    </Badge>
                  )}
                </div>

                <div className="text-3xl font-bold mb-4">{formatPrice(askingPrice)}</div>

                {/* Seller Info */}
                {listing.profile && (
                  <div className="flex items-center gap-3 p-3 bg-accent/10 rounded-lg">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={listing.profile.avatar_url || undefined} />
                      <AvatarFallback className="bg-accent text-black">
                        {listing.profile.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{listing.profile.full_name || "Unknown User"}</div>
                      <div className="text-sm text-muted-foreground">
                        On for {Math.floor((new Date().getTime() - new Date(listing.created_at).getTime()) / (1000 * 60 * 60 * 24 * 365))} Year
                      </div>
                    </div>
                  </div>
                )}
              </Card>

              {/* Main Image */}
              <Card className="overflow-hidden bg-card border-border">
                <div className="aspect-video bg-muted flex items-center justify-center relative">
                  {imageUrl && imageUrl !== '/placeholder.svg' ? (
                    <img 
                      src={imageUrl} 
                      alt={businessName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-muted-foreground">No image available</div>
                  )}
                  {listing.managed_by_ex && (
                    <Badge className="absolute top-4 left-4 bg-accent/90 text-black border-0">
                      Managed by EX
                    </Badge>
                  )}
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button 
                      onClick={handleFavorite}
                      disabled={isTogglingFavorite}
                      className="w-12 h-12 bg-background rounded-full flex items-center justify-center shadow-lg hover:bg-background/80 disabled:opacity-50"
                    >
                      {isTogglingFavorite ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-foreground"></div>
                      ) : (
                        <Heart className={`w-6 h-6 ${isFavorite ? "fill-destructive text-destructive" : ""}`} />
                      )}
                    </button>
                    <button 
                      onClick={handleShare}
                      className="w-12 h-12 bg-background rounded-full flex items-center justify-center shadow-lg hover:bg-background/80"
                    >
                      <Share2 className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </Card>

              {/* Description */}
              <Card className="p-6 bg-card border-border">
                <h3 className="text-xl font-semibold mb-4">Description</h3>
                {intro && (
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Intro</h4>
                    <p className="text-muted-foreground leading-relaxed">{intro}</p>
                  </div>
                )}
                {usp && (
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">USP</h4>
                    <p className="text-muted-foreground leading-relaxed">{usp}</p>
                  </div>
                )}
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-muted-foreground leading-relaxed">{adDescription}</p>
                </div>
              </Card>

              {/* General Info */}
              <Card className="p-6 bg-card border-border">
                <h3 className="text-xl font-semibold mb-6">General</h3>
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Location</div>
                    <div className="font-medium">{location}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Business Age</div>
                    <div className="font-medium">{getAnswerByQuestion(listing.brand || [], ['business age', 'age', 'years']) || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Monthly Profit</div>
                    <div className="font-medium">{avgMonthlyProfit > 0 ? `$${Math.round(avgMonthlyProfit).toLocaleString()}/m` : 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Profit Margin</div>
                    <div className="font-medium">
                      {totalRevenue > 0 ? `${Math.round((totalProfit / totalRevenue) * 100)}%` : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Total Revenue</div>
                    <div className="font-medium">{formatPrice(totalRevenue)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Total Profit</div>
                    <div className="font-medium">{formatPrice(totalProfit)}</div>
                  </div>
                </div>
              </Card>

              {/* Profit & Loss Table */}
              {financials.length > 0 && (
                <Card className="p-6 bg-card border-border">
                  <h3 className="text-xl font-semibold mb-6">Profit & Loss</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 bg-muted font-medium">Period</th>
                          <th className="text-center py-3 px-4 bg-accent text-black font-medium">Revenue</th>
                          <th className="text-center py-3 px-4 bg-muted font-medium">Cost</th>
                          <th className="text-center py-3 px-4 bg-muted font-medium">Net Profit</th>
                        </tr>
                      </thead>
                      <tbody>
                        {financials.slice(0, 12).map((financial: any, index: number) => (
                          <tr key={index} className="border-b border-border">
                            <td className="py-3 px-4">{financial.name || financial.period || `Period ${index + 1}`}</td>
                            <td className="py-3 px-4 text-center">{formatPrice(financial.revenue_amount)}</td>
                            <td className="py-3 px-4 text-center">{formatPrice(financial.annual_cost)}</td>
                            <td className="py-3 px-4 text-center font-medium">{formatPrice(financial.net_profit)}</td>
                          </tr>
                        ))}
                        {financials.length === 0 && (
                          <tr>
                            <td colSpan={4} className="py-3 px-4 text-center text-muted-foreground">No financial data available</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}

              {/* Statistics */}
              {listing.statistics && listing.statistics.length > 0 && (
                <Card className="p-6 bg-card border-border">
                  <h3 className="text-xl font-semibold mb-4">Statistics</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {conversionRate !== 'N/A' && (
                      <div className="p-4 bg-muted/30 rounded-lg">
                        <div className="text-sm text-muted-foreground mb-2">Conversion Rate</div>
                        <div className="text-2xl font-bold text-accent">{conversionRate}</div>
                      </div>
                    )}
                    {refundRate !== 'N/A' && (
                      <div className="p-4 bg-muted/30 rounded-lg">
                        <div className="text-sm text-muted-foreground mb-2">Refund Rate</div>
                        <div className="text-2xl font-bold text-accent">{refundRate}</div>
                      </div>
                    )}
                    {returningCustomers !== 'N/A' && (
                      <div className="p-4 bg-muted/30 rounded-lg">
                        <div className="text-sm text-muted-foreground mb-2">Returning customers</div>
                        <div className="text-2xl font-bold text-accent">{returningCustomers}</div>
                      </div>
                    )}
                    {emailSubscribers !== 'N/A' && (
                      <div className="p-4 bg-muted/30 rounded-lg">
                        <div className="text-sm text-muted-foreground mb-2">E-Mail Subscribers</div>
                        <div className="text-2xl font-bold text-accent">{emailSubscribers}</div>
                      </div>
                    )}
                    {avgOrderValue !== 'N/A' && (
                      <div className="p-4 bg-muted/30 rounded-lg">
                        <div className="text-sm text-muted-foreground mb-2">Average order value</div>
                        <div className="text-2xl font-bold text-accent">{formatPrice(avgOrderValue)}</div>
                      </div>
                    )}
                    {customerBase !== 'N/A' && (
                      <div className="p-4 bg-muted/30 rounded-lg">
                        <div className="text-sm text-muted-foreground mb-2">Customer base</div>
                        <div className="text-2xl font-bold text-accent">{customerBase}</div>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* Products */}
              {listing.productQuestion && listing.productQuestion.length > 0 && (
                <Card className="p-6 bg-card border-border">
                  <h3 className="text-xl font-semibold mb-4">Products</h3>
                  <div className="space-y-4">
                    {numProducts !== 'N/A' && (
                      <div className="flex items-center justify-between py-3 border-b border-border">
                        <span className="text-muted-foreground">Number Shop products</span>
                        <span className="font-medium">{numProducts}</span>
                      </div>
                    )}
                    {sellingModel !== 'N/A' && (
                      <div className="flex items-center justify-between py-3 border-b border-border">
                        <span className="text-muted-foreground">Selling Model</span>
                        <span className="font-medium">{sellingModel}</span>
                      </div>
                    )}
                    {hasInventory !== 'N/A' && (
                      <div className="flex items-center justify-between py-3 border-b border-border">
                        <span className="text-muted-foreground">Seller has inventory?</span>
                        <span className="font-medium">{hasInventory}</span>
                      </div>
                    )}
                    {inventoryValue !== 'N/A' && (
                      <div className="flex items-center justify-between py-3 border-b border-border">
                        <span className="text-muted-foreground">How much?</span>
                        <span className="font-medium">{formatPrice(inventoryValue)}</span>
                      </div>
                    )}
                    {inventoryIncluded !== 'N/A' && (
                      <div className="flex items-center justify-between py-3">
                        <span className="text-muted-foreground">Is it included in the price?</span>
                        <span className="font-medium">{inventoryIncluded}</span>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* Management */}
              {listing.managementQuestion && listing.managementQuestion.length > 0 && (
                <Card className="p-6 bg-card border-border">
                  <h3 className="text-xl font-semibold mb-4">Management</h3>
                  <div className="space-y-4">
                    {teamMembers !== 'N/A' && (
                      <div className="flex items-center justify-between py-3 border-b border-border">
                        <span className="text-muted-foreground">Team members</span>
                        <span className="font-medium">👥 {teamMembers}</span>
                      </div>
                    )}
                    {timeCommitment !== 'N/A' && (
                      <div className="flex items-center justify-between py-3 border-b border-border">
                        <span className="text-muted-foreground">Time commitment</span>
                        <span className="font-medium">⏰ {timeCommitment}</span>
                      </div>
                    )}
                    {cooCommitment !== 'N/A' && (
                      <div className="flex items-center justify-between py-3">
                        <span className="text-muted-foreground">COO commitment over week</span>
                        <span className="font-medium">⏱️ {cooCommitment}</span>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* Handover */}
              {listing.handover && listing.handover.length > 0 && (
                <Card className="p-6 bg-card border-border">
                  <h3 className="text-xl font-semibold mb-4">Handover</h3>
                  <div className="space-y-4">
                    {assetsIncluded !== 'N/A' && (
                      <div className="flex items-center justify-between py-3 border-b border-border">
                        <span className="text-muted-foreground">Assets included in the Sale</span>
                        <span className="font-medium">✅ {assetsIncluded}</span>
                      </div>
                    )}
                    {buyerSalesLength !== 'N/A' && (
                      <div className="flex items-center justify-between py-3 border-b border-border">
                        <span className="text-muted-foreground">Length of buyer sales</span>
                        <span className="font-medium">📅 {buyerSalesLength}</span>
                      </div>
                    )}
                    {sellerWillHire !== 'N/A' && (
                      <div className="flex items-center justify-between py-3 border-b border-border">
                        <span className="text-muted-foreground">Seller will hire (how business)?</span>
                        <span className="font-medium">✓ {sellerWillHire}</span>
                      </div>
                    )}
                    {timeCommitmentFrom !== 'N/A' && (
                      <div className="flex items-center justify-between py-3 border-b border-border">
                        <span className="text-muted-foreground">Time commitment from!?</span>
                        <span className="font-medium">📆 {timeCommitmentFrom}</span>
                      </div>
                    )}
                    {postSalesSupport !== 'N/A' && (
                      <div className="flex items-center justify-between py-3 border-b border-border">
                        <span className="text-muted-foreground">Seller offers Post sales support?</span>
                        <span className="font-medium">✓ {postSalesSupport}</span>
                      </div>
                    )}
                    {supportDuration !== 'N/A' && (
                      <div className="flex items-center justify-between py-3">
                        <span className="text-muted-foreground">Post purchase Support</span>
                        <span className="font-medium">📆 {supportDuration}</span>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* Social Media */}
              {socialAccounts.length > 0 && (
                <Card className="p-6 bg-card border-border">
                  <h3 className="text-xl font-semibold mb-4">Social Media</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {socialAccounts.map((account: any, index: number) => {
                      const platform = account.question || account.answer_for || 'Social Media';
                      const url = account.answer || '';
                      const followers = account.option?.[0] || '';
                      
                      return (
                        <div key={index} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                          <div className="text-2xl">
                            {platform.toLowerCase().includes('instagram') ? '📷' :
                             platform.toLowerCase().includes('twitter') || platform.toLowerCase().includes('x') ? '🐦' :
                             platform.toLowerCase().includes('tiktok') ? '🎵' :
                             platform.toLowerCase().includes('facebook') ? '👥' :
                             platform.toLowerCase().includes('youtube') ? '📺' :
                             '🌐'}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{platform}</div>
                            {url && <div className="text-sm text-muted-foreground">{url}</div>}
                            {followers && <div className="text-sm text-muted-foreground">{followers} followers</div>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              )}

              {/* Tools */}
              {tools.length > 0 && (
                <Card className="p-6 bg-card border-border">
                  <h3 className="text-xl font-semibold mb-4">Tools</h3>
                  <div className="flex flex-wrap gap-2">
                    {tools.map((tool: any, index: number) => (
                      <Badge key={index} variant="outline" className="px-3 py-1">
                        {tool.name || tool}
                      </Badge>
                    ))}
                  </div>
                </Card>
              )}

              {/* Attachments */}
              {attachments && Array.isArray(attachments) && attachments.length > 0 && (
                <Card className="p-6 bg-card border-border">
                  <h3 className="text-xl font-semibold mb-4">Attachments</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {attachments.map((attachment: string, index: number) => (
                      <Button 
                        key={index}
                        variant="outline" 
                        className="justify-start gap-2 border-border"
                        onClick={() => window.open(attachment, '_blank')}
                      >
                        <div className="h-10 w-10 bg-red-100 rounded flex items-center justify-center">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-medium text-sm">Attachment {index + 1}</div>
                          <div className="text-xs text-muted-foreground">Click to download</div>
                        </div>
                        <Download className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    ))}
                  </div>
                </Card>
              )}

              {/* Portfolio Link */}
              {listing.portfolioLink && (
                <Card className="p-6 bg-card border-border">
                  <h3 className="text-xl font-semibold mb-4">Portfolio</h3>
                  <a 
                    href={listing.portfolioLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-accent hover:underline"
                  >
                    {listing.portfolioLink}
                  </a>
                </Card>
              )}
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              <Card className="p-6 bg-card border-border sticky top-24">
                <h3 className="font-semibold mb-4">Status</h3>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Current Status</div>
                    {listing.status === 'published' ? (
                      <Badge className="bg-green-500/20 text-green-500 border-green-500/30">
                        Published
                      </Badge>
                    ) : listing.status === 'deleted' ? (
                      <Badge className="bg-red-500/20 text-red-500 border-red-500/30">
                        Deleted
                      </Badge>
                    ) : (
                      <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">
                        Draft
                      </Badge>
                    )}
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Created Date</div>
                    <div className="font-medium">
                      {new Date(listing.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Last Updated</div>
                    <div className="font-medium">
                      {new Date(listing.updated_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-border">
                  <div className="text-3xl font-bold mb-2">{formatPrice(askingPrice)}</div>
                  <div className="flex gap-2 mb-4">
                    <span className="px-3 py-1 bg-muted rounded-full text-xs">Multiple 1.5x Profit</span>
                    <span className="px-3 py-1 bg-muted rounded-full text-xs">0.5x Revenue</span>
                  </div>
                  
                  <div className="space-y-3">
                    <Button
                      variant="accent"
                      className="w-full rounded-full font-semibold"
                      onClick={handleContactSeller}
                      disabled={isStartingChat || !listing.userId && !listing.user_id}
                    >
                      {isStartingChat ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-background mr-2"></div>
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
                      variant="outline"
                      className="w-full rounded-full border-2"
                      onClick={() => window.print()}
                    >
                      Print Details
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ListingDetail;
