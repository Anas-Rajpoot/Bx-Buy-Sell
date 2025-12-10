import { Heart, User, Plus } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/lib/api";
import { NotificationDropdown } from "./NotificationDropdown";
import { toast } from "sonner";
import logo from "@/assets/_App Icon 1 (2).png";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [favoritesCount, setFavoritesCount] = useState(0);
  
  // Determine active route
  const isHomeActive = location.pathname === "/";
  const isAllListingsActive = location.pathname === "/all-listings";
  const isMyListingsActive = location.pathname === "/my-listings";

  useEffect(() => {
    if (isAuthenticated && user) {
      loadFavoritesCount();
    }
  }, [isAuthenticated, user]);

  const loadFavoritesCount = async () => {
    if (!user) return;
    
    try {
      const response = await apiClient.getFavorites();
      if (response.success && response.data) {
        const favorites = Array.isArray(response.data) ? response.data : [];
        setFavoritesCount(favorites.length);
      }
    } catch (error) {
      console.error('Error loading favorites count:', error);
    }
  };

  const handleFavoritesClick = () => {
    if (!isAuthenticated || !user) {
      toast.error("Please login to view your favorites");
      navigate("/login");
      return;
    }
    // Navigate to favorites page using React Router
    navigate("/favourites");
  };

  const isHowToBuyActive = location.pathname === "/how-to-buy";
  const isHowToSellActive = location.pathname === "/how-to-sell";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4">
      <div className="w-full max-w-6xl mx-auto px-4">
        <div className="bg-primary backdrop-blur-xl rounded-full px-6 py-3 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center">
              <img 
                src={logo} 
                alt="EX Logo" 
                className="h-10 w-10 object-contain"
              />
          </Link>
        </div>
        
        <nav className="hidden md:flex items-center gap-2">
          <Button 
            size="sm" 
              className={`rounded-full px-4 py-2 ${
                isHomeActive 
                  ? "bg-[#D3FC50] text-black hover:bg-[#D3FC50]/90 font-medium" 
                  : "bg-[#FFFFFF0D] text-white hover:bg-[#D3FC50] hover:text-black"
              }`}
            asChild
          >
            <Link to="/">Home</Link>
          </Button>
          <Button 
            size="sm" 
              className={`rounded-full px-4 py-2 ${
                isAllListingsActive 
                  ? "bg-[#D3FC50] text-black hover:bg-[#D3FC50]/90 font-medium" 
                  : "bg-[#FFFFFF0D] text-white hover:bg-[#D3FC50] hover:text-black"
              }`}
            asChild
          >
            <Link to="/all-listings">All Listings</Link>
          </Button>
          <Button 
            size="sm" 
              className={`rounded-full px-4 py-2 ${
                isHowToBuyActive 
                  ? "bg-[#D3FC50] text-black hover:bg-[#D3FC50]/90 font-medium" 
                  : "bg-[#FFFFFF0D] text-white hover:bg-[#D3FC50] hover:text-black"
            }`}
            asChild
          >
            <Link to="/how-to-buy">How To Buy</Link>
          </Button>
          <Button 
            size="sm" 
              className={`rounded-full px-4 py-2 ${
                isHowToSellActive 
                  ? "bg-[#D3FC50] text-black hover:bg-[#D3FC50]/90 font-medium" 
                  : "bg-[#FFFFFF0D] text-white hover:bg-[#D3FC50] hover:text-black"
            }`}
            asChild
          >
            <Link to="/how-to-sell">How To Sell</Link>
          </Button>
        </nav>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleFavoritesClick}
              className="relative w-10 h-10 rounded-full bg-[#FFFFFF0D] flex items-center justify-center text-white hover:bg-[#D3FC50] hover:text-black transition-colors"
          >
            <Heart className="w-6 h-6" />
            {isAuthenticated && user && favoritesCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs rounded-full">
                {favoritesCount > 9 ? "9+" : favoritesCount}
              </Badge>
            )}
          </button>
          
          {isAuthenticated && user ? (
            <>
              <NotificationDropdown userId={user.id} variant="light" />
              <Button 
                variant="ghost" 
                size="icon" 
                  className="w-10 h-10 rounded-full bg-[#FFFFFF0D] text-white hover:bg-[#D3FC50] hover:text-black transition-colors"
                asChild
              >
                <Link to="/profile">
                  <User className="w-6 h-6" />
                </Link>
              </Button>
                <Button 
                  size="sm" 
                  className="bg-[#D3FC50] text-black hover:bg-[#D3FC50]/90 rounded-full font-medium" 
                  asChild
                >
                <Link to="/dashboard">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Listing
                </Link>
              </Button>
            </>
          ) : (
            <>
                <Button variant="ghost" size="sm" className="text-gray-700 hover:bg-gray-100/50 rounded-full" asChild>
                <Link to="/login">Login</Link>
              </Button>
                <Button size="sm" className="bg-[#D3FC50] text-black hover:bg-[#D3FC50]/90 rounded-full font-medium" asChild>
                <Link to="/register">Sign Up</Link>
              </Button>
            </>
          )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
