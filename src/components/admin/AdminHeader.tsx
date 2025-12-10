import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
import logo from "@/assets/_App Icon 1 (2).png";

interface AdminHeaderProps {
  title?: string;
}

export const AdminHeader = ({ title = "Dashboard" }: AdminHeaderProps) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [userName, setUserName] = useState("Admin");

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
      } else {
        // Fallback to user data from hook
        const firstName = user.first_name || '';
        const lastName = user.last_name || '';
        const fullName = `${firstName} ${lastName}`.trim();
        setUserName(fullName || user.email || "Admin");
      }
    } catch (error) {
      console.error("Error loading user info:", error);
      // Fallback to user data from hook
      const firstName = user?.first_name || '';
      const lastName = user?.last_name || '';
      const fullName = `${firstName} ${lastName}`.trim();
      setUserName(fullName || user?.email || "Admin");
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
      <div className="px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center">
            <img 
              src={logo} 
              alt="EX Logo" 
              className="h-10 w-10 object-contain"
            />
          </Link>
        {title && (
          <h1 className="text-xl">
            Welcome back, <span className="font-semibold">{userName}</span> 👋
          </h1>
        )}
        </div>
        <div className="flex items-center gap-4 ml-auto">
          {user?.id && <NotificationDropdown userId={user.id} variant="dark" />}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 hover:bg-muted">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {getInitials(userName)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{userName}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/profile")} className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
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
