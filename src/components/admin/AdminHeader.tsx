import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationDropdown } from "@/components/NotificationDropdown";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/lib/api";
import { Settings, LogOut, User } from "lucide-react";
import { toast } from "sonner";

interface AdminHeaderProps {
  title?: string;
}

// Map route paths to display titles
const getPageTitle = (pathname: string, customTitle?: string): string => {
  if (customTitle) return customTitle;
  
  const routeMap: Record<string, string> = {
    "/admin/dashboard": "Dashboard",
    "/admin/team": "Team Members",
    "/admin/users": "Users",
    "/admin/listings": "Listings",
    "/admin/chats": "Chats",
    "/admin/chat-list": "Chat List",
    "/admin/chat-analytics": "Chat Analytics",
    "/admin/monitoring-alerts": "Monitoring Alerts",
    "/admin/detect-words": "Detect Words",
    "/admin/content": "Content Management",
    "/admin/settings": "Settings",
  };
  
  // Check for exact match first
  if (routeMap[pathname]) {
    return routeMap[pathname];
  }
  
  // Check for partial matches (e.g., /admin/content/*)
  for (const [route, title] of Object.entries(routeMap)) {
    if (pathname.startsWith(route)) {
      return title;
    }
  }
  
  return "Dashboard";
};

export const AdminHeader = ({ title }: AdminHeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [userName, setUserName] = useState("Admin");
  const [userProfilePic, setUserProfilePic] = useState<string | null>(null);
  
  // Get page title from route if not provided
  const pageTitle = title || getPageTitle(location.pathname);

  useEffect(() => {
    if (user) {
      loadUserInfo();
    }
  }, [user]);

  const loadUserInfo = async () => {
    if (!user) return;
    
    try {
      const response = await apiClient.getUserById(user.id);
      if (response.success && response.data) {
        const firstName = response.data.first_name || '';
        const lastName = response.data.last_name || '';
        const fullName = `${firstName} ${lastName}`.trim();
        setUserName(fullName || user.email || "Admin");
        setUserProfilePic(response.data.profile_pic || null);
      } else {
        // Fallback to user data from hook
        const firstName = user.first_name || '';
        const lastName = user.last_name || '';
        const fullName = `${firstName} ${lastName}`.trim();
        setUserName(fullName || user.email || "Admin");
        setUserProfilePic(user.profile_pic || null);
      }
    } catch (error) {
      console.error("Error loading user info:", error);
      // Fallback to user data from hook
      const firstName = user?.first_name || '';
      const lastName = user?.last_name || '';
      const fullName = `${firstName} ${lastName}`.trim();
      setUserName(fullName || user?.email || "Admin");
      setUserProfilePic(user?.profile_pic || null);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      navigate("/admin/login");
    } catch (error) {
      toast.error("Failed to log out");
      console.error("Logout error:", error);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="border-b bg-background sticky top-0 z-10">
      <div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
          {/* Mobile/Tablet Menu Button */}
          <div className="lg:hidden">
            <AdminSidebar isMobile={true} />
          </div>
          
          {/* Page Title */}
          <h1 className="text-base sm:text-lg lg:text-xl font-medium truncate">
            {pageTitle}
          </h1>
        </div>
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          {user?.id && <NotificationDropdown userId={user.id} variant="dark" />}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 hover:bg-muted">
                <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                  {userProfilePic ? (
                    <AvatarImage src={userProfilePic} alt={userName} />
                  ) : null}
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs sm:text-sm">
                    {getInitials(userName)}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline text-sm font-medium">{userName}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/admin/profile")} className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/admin/settings")} className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
