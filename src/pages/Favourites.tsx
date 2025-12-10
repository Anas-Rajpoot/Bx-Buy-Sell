import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ListingsSidebar } from "@/components/listings/ListingsSidebar";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/lib/api";

const Favourites = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const hasLoadedRef = useRef(false);
  const userIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
      return;
    }

    // Only load favorites once per user, or if user ID changes
    const currentUserId = user?.id || null;
    if (isAuthenticated && user && (currentUserId !== userIdRef.current || !hasLoadedRef.current)) {
      userIdRef.current = currentUserId;
      hasLoadedRef.current = true;
      loadFavorites();
    }
  }, [isAuthenticated, authLoading, user?.id, navigate]); // Use user?.id instead of user

  const loadFavorites = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const response = await apiClient.getFavorites();
      if (response.success && response.data) {
        const favoritesData = Array.isArray(response.data) ? response.data : [];
        setFavorites(favoritesData);
      } else {
        console.error('Error loading favorites:', response.error);
        setFavorites([]);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null; // Will redirect to login
  }

  return (
    <div className="flex min-h-screen bg-background">
      <ListingsSidebar />

      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search"
                  className="w-full px-4 py-2 border rounded-full pl-10"
                />
              </div>
            </div>
            
            <Button
              onClick={() => navigate("/")}
              className="bg-[#D3FC50] text-black hover:bg-[#D3FC50]/90 rounded-full"
            >
              + Add Favourites
            </Button>
          </div>

          {/* Favorites List */}
          {favorites.length === 0 ? (
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center max-w-md">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                  <Heart className="w-10 h-10 text-muted-foreground" />
                </div>
                <h1 className="text-3xl font-bold mb-4">Favourites</h1>
                <p className="text-muted-foreground mb-8">
                  Your favorite listings will appear here. Start browsing to save companies you're interested in.
                </p>
                <Button
                  onClick={() => navigate("/")}
                  className="bg-[#D3FC50] text-black hover:bg-[#D3FC50]/90 rounded-full"
                >
                  Browse Listings
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <h1 className="text-3xl font-bold mb-6">Favourites ({favorites.length})</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites.map((favorite: any) => {
                  const listing = favorite.listing || favorite;
                  const listingId = listing.id || favorite.listingId;
                  
                  return (
                    <div
                      key={favorite.id || listingId}
                      className="bg-card rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow border border-border"
                    >
                      <div className="relative h-48 bg-muted">
                        {listing.image_url && (
                          <img
                            src={listing.image_url}
                            alt={listing.title || listing.name || "Listing"}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-bold mb-2">
                          {listing.title || listing.name || listing.brand?.[0]?.businessName || "Unnamed Business"}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {listing.description || listing.brand?.[0]?.businessDescription || "No description available"}
                        </p>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 rounded-full"
                            onClick={() => listingId && navigate(`/listing/${listingId}`)}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Favourites;
