import { useState, useEffect } from "react";
import { Bell, Check, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
// TODO: Implement notification backend endpoints
// For now, notifications are disabled

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  link: string | null;
  created_at: string;
}

interface NotificationDropdownProps {
  userId?: string;
  variant?: "light" | "dark";
}

export const NotificationDropdown = ({ userId, variant = "dark" }: NotificationDropdownProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // TODO: Implement notification backend endpoints
    // For now, notifications are disabled
    // if (userId) {
    //   loadNotifications();
    // }
  }, [userId]);

  const loadNotifications = async () => {
    // TODO: Implement notification backend endpoints
    // const response = await apiClient.getNotifications(userId);
    // if (response.success && response.data) {
    //   setNotifications(response.data);
    //   setUnreadCount(response.data.filter((n) => !n.read).length || 0);
    // }
  };

  const markAsRead = async (notificationId: string) => {
    // TODO: Implement notification backend endpoints
    // const response = await apiClient.markNotificationAsRead(notificationId);
    // if (response.success) {
    //   loadNotifications();
    // } else {
    //   toast.error("Failed to mark notification as read");
    // }
  };

  const deleteNotification = async (notificationId: string) => {
    // TODO: Implement notification backend endpoints
    // const response = await apiClient.deleteNotification(notificationId);
    // if (response.success) {
    //   loadNotifications();
    // } else {
    //   toast.error("Failed to delete notification");
    // }
  };

  const markAllAsRead = async () => {
    // TODO: Implement notification backend endpoints
    // if (!userId) return;
    // const response = await apiClient.markAllNotificationsAsRead(userId);
    // if (response.success) {
    //   loadNotifications();
    // } else {
    //   toast.error("Failed to mark all as read");
    // }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "success":
        return "text-green-500";
      case "warning":
        return "text-yellow-500";
      case "error":
        return "text-red-500";
      default:
        return "text-blue-500";
    }
  };

  if (!userId) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "relative p-2 rounded-lg transition-colors",
            variant === "light" 
              ? "text-primary-foreground hover:text-accent" 
              : "hover:bg-muted"
          )}
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-destructive text-destructive-foreground text-xs">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-2 py-2">
          <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="h-auto p-1 text-xs"
            >
              Mark all as read
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground text-sm">
              No notifications yet
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  "p-3 border-b last:border-b-0 hover:bg-muted/50 transition-colors",
                  !notification.read && "bg-muted/30"
                )}
              >
                <div className="flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className={cn("font-semibold text-sm", getNotificationColor(notification.type))}>
                        {notification.title}
                      </h4>
                      {!notification.read && (
                        <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {new Date(notification.created_at).toLocaleDateString()}
                      </span>
                      {notification.link && (
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => handleNotificationClick(notification)}
                          className="h-auto p-0 text-xs"
                        >
                          View <ExternalLink className="w-3 h-3 ml-1" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => markAsRead(notification.id)}
                      >
                        <Check className="w-3 h-3" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-destructive hover:text-destructive"
                      onClick={() => deleteNotification(notification.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
