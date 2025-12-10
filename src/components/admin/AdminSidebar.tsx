import { LayoutDashboard, Users, List, MessageSquare, FileText, Settings, LogOut, UserCog, Bell, AlertCircle, FileSearch, Grid3x3, Building2, Wrench, CreditCard, Info, User, Megaphone, HandshakeIcon, Package } from "lucide-react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import logo from "@/assets/_App Icon 1 (2).png";

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
  { id: "team", label: "Team Members", icon: UserCog, path: "/admin/team" },
  { id: "users", label: "Users", icon: Users, path: "/admin/users" },
  { id: "listings", label: "Listings", icon: List, path: "/admin/listings" },
  { 
    id: "chat", 
    label: "Chat", 
    icon: MessageSquare, 
    path: "/admin/chats",
    subItems: [
      { id: "chat-list", label: "Chat List", icon: MessageSquare, path: "/admin/chat-list" },
      { id: "all-chats", label: "All Chats", icon: MessageSquare, path: "/admin/chats" },
      { id: "analytics", label: "Analytics & Routing", icon: LayoutDashboard, path: "/admin/chat-analytics" },
      { id: "monitoring", label: "Monitoring Alerts", icon: Bell, path: "/admin/monitoring-alerts" },
      { id: "detect-words", label: "Detect Words", icon: FileSearch, path: "/admin/detect-words" },
    ]
  },
  { 
    id: "content", 
    label: "Content Management", 
    icon: FileText, 
    path: "/admin/content",
    subItems: [
      { id: "category", label: "Category", icon: Grid3x3, path: "/admin/content/category" },
      { id: "brand-info", label: "Brand Information", icon: Building2, path: "/admin/content/brand-info" },
      { id: "tools", label: "Tools", icon: Wrench, path: "/admin/content/tools" },
      { id: "financials", label: "Financials", icon: CreditCard, path: "/admin/content/financials" },
      { id: "additional-infos", label: "Additional Infos", icon: Info, path: "/admin/content/additional-infos" },
      { id: "accounts", label: "Accounts", icon: User, path: "/admin/content/accounts" },
      { id: "ad-informations", label: "Ad Informations", icon: Megaphone, path: "/admin/content/ad-informations" },
      { id: "handover", label: "Handover", icon: HandshakeIcon, path: "/admin/content/handover" },
      { id: "packages", label: "Packages", icon: Package, path: "/admin/content/packages" },
    ]
  },
];

export const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [expandedItems, setExpandedItems] = useState<string[]>(["chat", "content"]);

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    navigate("/admin/login");
  };

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const isPathActive = (path: string, subItems?: any[]) => {
    if (location.pathname === path) return true;
    if (subItems) {
      return subItems.some(sub => location.pathname === sub.path || location.pathname.startsWith(sub.path + '/'));
    }
    return location.pathname.startsWith(path + '/');
  };

  return (
    <aside className="w-60 bg-[hsl(0_0%_0%)] min-h-screen flex flex-col">
      <div className="p-6">
        <Link to="/" className="flex items-center justify-center">
          <img 
            src={logo} 
            alt="EX Logo" 
            className="h-12 w-12 object-contain"
          />
        </Link>
      </div>
      
      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = isPathActive(item.path, item.subItems);
          const isExpanded = expandedItems.includes(item.id);
          const hasSubItems = item.subItems && item.subItems.length > 0;
          
          return (
            <div key={item.id}>
              <button
                onClick={() => {
                  if (hasSubItems) {
                    toggleExpanded(item.id);
                  } else {
                    navigate(item.path);
                  }
                }}
                className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive && !hasSubItems
                    ? "bg-accent text-[hsl(0_0%_0%)]" 
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                {hasSubItems && (
                  isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
                )}
              </button>

              {/* Sub-items */}
              {hasSubItems && isExpanded && (
                <div className="ml-4 mt-1 space-y-1">
                  {item.subItems.map((subItem) => {
                    const SubIcon = subItem.icon;
                    const isSubActive = location.pathname === subItem.path || location.pathname.startsWith(subItem.path + '/');
                    
                    return (
                      <button
                        key={subItem.id}
                        onClick={() => navigate(subItem.path)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm ${
                          isSubActive
                            ? "bg-white/10 text-white" 
                            : "text-white/60 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        <SubIcon className="w-4 h-4" />
                        <span>{subItem.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="p-4 space-y-1">
        <button
          onClick={() => navigate("/admin/settings")}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-all"
        >
          <Settings className="w-5 h-5" />
          <span className="text-sm font-medium">Settings</span>
        </button>
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Log Out</span>
        </button>
      </div>
    </aside>
  );
};
