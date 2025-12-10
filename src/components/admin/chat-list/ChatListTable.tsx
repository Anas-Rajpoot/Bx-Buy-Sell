import { useState, useEffect } from "react";
// TODO: Implement admin chat list backend endpoints
// import { apiClient } from "@/lib/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2, MoreVertical } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { TeamMemberAssignDialog } from "./TeamMemberAssignDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Conversation {
  id: string;
  listing: {
    title: string;
    image_url: string | null;
  } | null;
  last_message: string | null;
  last_message_at: string | null;
  created_at: string;
  assigned_to: string | null;
  resolution_status: string;
  buyer_profile: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
  seller_profile: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
  assigned_profile: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

interface ChatListTableProps {
  searchQuery: string;
  filterType: string;
}

export const ChatListTable = ({ searchQuery, filterType }: ChatListTableProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchConversations();
    // TODO: Replace with WebSocket or polling when backend endpoints are ready
    const interval = setInterval(() => {
      fetchConversations();
    }, 30000); // Poll every 30 seconds

    return () => {
      clearInterval(interval);
    };
  }, []);

  const fetchConversations = async () => {
    try {
      // TODO: Replace with backend API call
      // const response = await apiClient.getAdminChats();
      // if (response.success && response.data) {
      //   setConversations(response.data);
      // }
      setConversations([]); // Disabled until backend endpoints are implemented

      // TODO: Fetch user profiles from backend API when endpoints are implemented
      // For now, set empty array
      setConversations([]);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast({
        title: "Error",
        description: "Failed to fetch conversations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = (conversationId: string) => {
    setSelectedConversation(conversationId);
    setAssignDialogOpen(true);
  };

  const handleStatusChange = async (conversationId: string, newStatus: string) => {
    try {
      // TODO: Replace with backend API call
      // const response = await apiClient.updateChatStatus(conversationId, newStatus);
      // if (response.success) {
      //   toast({
      //     title: "Status updated",
      //     description: `Conversation marked as ${newStatus}`
      //   });
      //   fetchConversations();
      // }
      toast({
        title: "Not implemented",
        description: "Chat status update not yet implemented",
        variant: "destructive"
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update conversation status",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'open': { color: 'bg-blue-500/20 text-blue-700 border-blue-300', label: 'Open' },
      'pending': { color: 'bg-yellow-500/20 text-yellow-700 border-yellow-300', label: 'Pending' },
      'resolved': { color: 'bg-green-500/20 text-green-700 border-green-300', label: 'Resolved' },
      'closed': { color: 'bg-gray-500/20 text-gray-700 border-gray-300', label: 'Closed' },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.open;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const filteredConversations = conversations
    .filter(conv => {
      const matchesSearch = 
        conv.listing?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.buyer_profile?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.seller_profile?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.last_message?.toLowerCase().includes(searchQuery.toLowerCase());

      if (filterType === 'assigned') return matchesSearch && conv.assigned_to;
      if (filterType === 'unassigned') return matchesSearch && !conv.assigned_to;
      return matchesSearch;
    });

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Loading conversations...</div>;
  }

  return (
    <>
      <div className="p-6">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-4 px-4 font-semibold text-sm">S no</th>
              <th className="text-left py-4 px-4 font-semibold text-sm">User Group</th>
              <th className="text-left py-4 px-4 font-semibold text-sm">Last Message</th>
              <th className="text-left py-4 px-4 font-semibold text-sm">Assignment</th>
              <th className="text-left py-4 px-4 font-semibold text-sm">Resolution</th>
              <th className="text-left py-4 px-4 font-semibold text-sm">Time</th>
              <th className="text-left py-4 px-4 font-semibold text-sm">Created Date</th>
              <th className="text-left py-4 px-4 font-semibold text-sm">Assigned to</th>
              <th className="text-left py-4 px-4 font-semibold text-sm">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredConversations.map((conv, index) => (
              <tr key={conv.id} className="border-b hover:bg-muted/50">
                <td className="py-4 px-4 text-sm">132</td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={conv.listing?.image_url || ''} />
                      <AvatarFallback>
                        {conv.listing?.title?.[0] || 'C'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{conv.listing?.title || 'Untitled'}</p>
                      <p className="text-xs text-muted-foreground">for sale</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4 text-sm max-w-xs truncate">
                  "{conv.last_message || 'No messages yet'}"
                </td>
                <td className="py-4 px-4">
                  {conv.assigned_to ? (
                    <Badge className="bg-green-500/20 text-green-700 border-green-300">
                      Assigned
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="bg-red-500/20 text-red-700 border-red-300">
                      Unassigned
                    </Badge>
                  )}
                </td>
                <td className="py-4 px-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        {getStatusBadge(conv.resolution_status)}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleStatusChange(conv.id, 'open')}>
                        Open
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusChange(conv.id, 'pending')}>
                        Pending
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusChange(conv.id, 'resolved')}>
                        Resolved
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusChange(conv.id, 'closed')}>
                        Closed
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
                <td className="py-4 px-4 text-sm text-muted-foreground">
                  {conv.last_message_at 
                    ? formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: true })
                    : 'N/A'}
                </td>
                <td className="py-4 px-4 text-sm text-muted-foreground">
                  {format(new Date(conv.created_at), 'yyyy-MM-dd')}
                </td>
                <td className="py-4 px-4">
                  {conv.assigned_profile ? (
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={conv.assigned_profile.avatar_url || ''} />
                        <AvatarFallback>
                          {conv.assigned_profile.full_name?.[0] || 'A'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{conv.assigned_profile.full_name}</span>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAssign(conv.id)}
                    >
                      Add+
                    </Button>
                  )}
                </td>
                <td className="py-4 px-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredConversations.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No conversations found
          </div>
        )}

        {/* Pagination */}
        <div className="mt-6 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {filteredConversations.length > 0 
              ? `Showing 1-${filteredConversations.length} of ${conversations.length} total`
              : 'No conversations to display'
            }
          </span>
          {filteredConversations.length > 0 && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="w-10 h-10 rounded-full bg-[#D4FF00] text-black">
                1
              </Button>
              <Button variant="ghost" size="sm" className="w-10 h-10 rounded-full">
                2
              </Button>
              <Button variant="ghost" size="sm" className="w-10 h-10 rounded-full">
                3
              </Button>
            </div>
          )}
        </div>
      </div>

      {selectedConversation && (
        <TeamMemberAssignDialog
          open={assignDialogOpen}
          onOpenChange={setAssignDialogOpen}
          conversationId={selectedConversation}
          onAssigned={fetchConversations}
        />
      )}
    </>
  );
};
