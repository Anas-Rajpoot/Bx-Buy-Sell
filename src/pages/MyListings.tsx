import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ListingsSidebar } from "@/components/listings/ListingsSidebar";
import { ListingCardDashboard } from "@/components/listings/ListingCardDashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, ChevronDown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";
import { NotificationDropdown } from "@/components/NotificationDropdown";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Listing {
  id: string;
  title: string;
  price: number;
  image_url?: string;
  status: "draft" | "published" | "archived";
  managed_by_ex: boolean;
  category_id?: string;
  created_at: string;
  requests_count: number;
  unread_messages_count: number;
}

const MyListings = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [fullName, setFullName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate("/login");
      } else {
        loadListings();
        loadUserProfile();
      }
      setLoading(false);
    }
  }, [user, authLoading, navigate]);

  const loadUserProfile = async () => {
    if (!user) return;
    
    const response = await apiClient.getUserById(user.id);
    if (response.success && response.data) {
      const firstName = response.data.first_name || '';
      const lastName = response.data.last_name || '';
      setFullName(`${firstName} ${lastName}`.trim() || user.email);
    } else {
      setFullName(user.email);
    }
  };

  const loadListings = async () => {
    if (!user) return;

    try {
      // Get all listings (not just PUBLISH) so user can see drafts too
      const response = await apiClient.getListings({
        nocache: 'true', // Ensure fresh data
      });

      if (response.success && response.data) {
        console.log('All listings fetched:', response.data.length);
        console.log('Current user ID:', user.id);
        
        // Filter listings by current user - check both userId and user_id
        const userListings = Array.isArray(response.data) 
          ? response.data.filter((listing: any) => {
              const listingUserId = listing.userId || listing.user_id;
              const matches = listingUserId === user.id;
              if (matches) {
                console.log('Found matching listing:', listing.id, 'userId:', listingUserId);
              }
              return matches;
            })
          : [];
        
        console.log('Filtered user listings:', userListings.length);
        
        // Extract title from brand questions (same as admin listings)
        const mappedListings: Listing[] = userListings.map((listing: any) => {
          // Get title from brand data
          let title = 'Untitled Listing';
          if (listing.brand && Array.isArray(listing.brand) && listing.brand.length > 0) {
            const brandNameQuestion = listing.brand.find((b: any) => 
              b.question?.toLowerCase().includes('brand name') ||
              b.question?.toLowerCase().includes('business name') ||
              b.question?.toLowerCase().includes('name') ||
              b.question?.toLowerCase().includes('company')
            );
            if (brandNameQuestion?.answer) {
              title = brandNameQuestion.answer;
            } else if (listing.brand[0]?.answer) {
              title = listing.brand[0].answer;
            }
          }
          
          // Check advertisement for title
          if (listing.advertisement && Array.isArray(listing.advertisement) && listing.advertisement.length > 0) {
            const titleQuestion = listing.advertisement.find((a: any) => 
              a.question?.toLowerCase().includes('title')
            );
            if (titleQuestion?.answer && titleQuestion.answer.trim()) {
              title = titleQuestion.answer;
            }
          }
          
          // Normalize status
          let normalizedStatus = listing.status?.toLowerCase() || 'draft';
          if (normalizedStatus === 'publish') normalizedStatus = 'published';
          
          // Get asking price from brand questions
          let price = 0;
          if (listing.brand && Array.isArray(listing.brand)) {
            const priceQuestion = listing.brand.find((b: any) => 
              b.question?.toLowerCase().includes('asking price') ||
              b.question?.toLowerCase().includes('price')
            );
            if (priceQuestion?.answer) {
              const parsedPrice = parseFloat(priceQuestion.answer);
              if (!isNaN(parsedPrice)) {
                price = parsedPrice;
              }
            }
          }
          
          // Get image from advertisement or brand
          let image_url = '';
          if (listing.advertisement && Array.isArray(listing.advertisement)) {
            const photoQuestion = listing.advertisement.find((a: any) => 
              a.question?.toLowerCase().includes('photo') || 
              a.answer_type === 'PHOTO'
            );
            if (photoQuestion?.answer) {
              image_url = Array.isArray(photoQuestion.answer) ? photoQuestion.answer[0] : photoQuestion.answer;
            }
          }
          if (!image_url && listing.brand && Array.isArray(listing.brand)) {
            const brandInfo = listing.brand[0];
            if (brandInfo?.businessPhoto?.[0]) {
              image_url = brandInfo.businessPhoto[0];
            } else if (brandInfo?.logo) {
              image_url = brandInfo.logo;
            }
          }
          
          return {
            id: listing.id,
            title: title,
            price: price,
            image_url: image_url || listing.image_url || listing.image || '',
            status: normalizedStatus,
            managed_by_ex: listing.managed_by_ex || false,
            category_id: listing.category?.[0]?.id || listing.category_id || '',
            created_at: listing.created_at || listing.createdAt || new Date().toISOString(),
            requests_count: listing.requests_count || 0,
            unread_messages_count: listing.unread_messages_count || 0,
          };
        });

        console.log('Mapped listings:', mappedListings.length);
        setListings(mappedListings);
      } else {
        toast.error(response.error || "Failed to load listings");
      }
    } catch (error: any) {
      console.error("Error loading listings:", error);
      toast.error("Failed to load listings");
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const filteredListings = listings.filter((listing) =>
    listing.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <ListingsSidebar />

      <div className="flex-1">
        {/* Header */}
        <header className="border-b border-border bg-background">
          <div className="flex items-center justify-between px-8 py-4">
            {/* Search */}
            <div className="relative w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-lg"
              />
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-4">
              <Button
                className="bg-[#D3FC50] text-black hover:bg-[#D3FC50]/90 rounded-full font-semibold"
                onClick={() => navigate("/dashboard")}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Listing
              </Button>

              <NotificationDropdown userId={user.id} variant="dark" />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 hover:bg-muted px-3 py-2 rounded-lg transition-colors">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getInitials(fullName || "User")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{fullName || "User"}</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/settings")}>
                    Settings
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-8">
          {filteredListings.length === 0 ? (
            <div className="text-center py-20">
              <div className="max-w-md mx-auto">
                <h2 className="text-2xl font-semibold mb-4">
                  {searchQuery ? "No listings found" : "No listings yet"}
                </h2>
                <p className="text-muted-foreground mb-8">
                  {searchQuery
                    ? "Try adjusting your search"
                    : "Create your first listing to showcase your business to potential buyers"}
                </p>
                {!searchQuery && (
                  <Button
                    onClick={() => navigate("/dashboard")}
                    size="lg"
                    className="bg-[#D3FC50] text-black hover:bg-[#D3FC50]/90 rounded-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Listing
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredListings.map((listing) => (
                <ListingCardDashboard
                  key={listing.id}
                  {...listing}
                  onUpdate={loadListings}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default MyListings;
