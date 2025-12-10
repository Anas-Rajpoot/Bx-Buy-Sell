import { Link, useLocation, useNavigate } from "react-router-dom";
import { List, Heart, MessageSquare, User, ShieldCheck, Settings, LogOut, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import logo from "@/assets/_App Icon 1 (2).png";

export const ListingsSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      navigate("/");
    } catch (error) {
      toast.error("Error logging out");
    }
  };

  const menuItems = [
    { icon: List, label: "My Listings", path: "/my-listings" },
    { icon: Heart, label: "Favourites", path: "/favourites" },
    { icon: MessageSquare, label: "Chat", path: "/chat" },
    { icon: User, label: "Account Details", path: "/profile" },
    { icon: ShieldCheck, label: "Verify Your Account", path: "/verify-account" },
  ];

  return (
    <aside className="w-64 bg-black text-white min-h-screen flex flex-col">
      {/* Logo */}
      <Link to="/" className="p-6 flex items-center justify-center">
        <img 
          src={logo} 
          alt="EX Logo" 
          className="h-12 w-12 object-contain"
        />
      </Link>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-full transition-colors",
              location.pathname === item.path
                ? "bg-[#D3FC50] text-black"
                : "text-white hover:bg-white/10"
            )}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Upgrade Section */}
      <div className="mx-4 mb-6 bg-[#D3FC50] rounded-3xl p-6 text-black">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center">
            <Rocket className="w-8 h-8 text-[#D3FC50]" />
          </div>
        </div>
        <h3 className="text-lg font-bold text-center mb-2">
          Upgrade Your
          <br />
          Account To Pro
        </h3>
        <Button
          className="w-full bg-black text-[#D3FC50] hover:bg-black/90 rounded-full font-semibold"
          size="lg"
        >
          Let's Go →
        </Button>
      </div>

      {/* Bottom Menu */}
      <div className="px-4 pb-6 space-y-2">
        <Link
          to="/settings"
          className="flex items-center gap-3 px-4 py-3 text-white hover:bg-white/10 rounded-full transition-colors"
        >
          <Settings className="w-5 h-5" />
          <span>Settings</span>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-white/10 rounded-full transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
};
