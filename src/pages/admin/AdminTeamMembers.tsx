import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Plus, MoreVertical, Eye, Edit, MessageSquare, RefreshCw, Trash2, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AddMemberDialog } from "@/components/admin/AddMemberDialog";
import { EditMemberDialog } from "@/components/admin/EditMemberDialog";
import { useTeamMembers, TeamMember } from "@/hooks/useTeamMembers";
import { useUpdateAvailability } from "@/hooks/useUpdateAvailability";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";

export default function AdminTeamMembers() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const { data: members, isLoading, error, refetch } = useTeamMembers();
  const updateAvailability = useUpdateAvailability();

  if (error) {
    console.error("Team members error:", error);
    // Don't show toast on every render, only show it once
  }

  const filteredMembers = members?.filter((member) => {
    const query = searchQuery.toLowerCase();
    return (
      member.full_name?.toLowerCase().includes(query) ||
      member.email.toLowerCase().includes(query)
    );
  }) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-500/20 text-green-500 border-green-500/30";
      case "busy":
        return "bg-yellow-500/20 text-yellow-500 border-yellow-500/30";
      case "offline":
        return "bg-red-500/20 text-red-500 border-red-500/30";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "available":
        return "Available";
      case "busy":
        return "Busy";
      case "offline":
        return "Offline";
      default:
        return "Unknown";
    }
  };

  const handleAvailabilityChange = (userId: string, newStatus: string) => {
    updateAvailability.mutate({ userId, status: newStatus });
  };

  const handleDelete = async (member: TeamMember) => {
    if (!confirm(`Are you sure you want to delete team member "${member.full_name || member.email}"? This action cannot be undone.`)) {
      return;
    }

    try {
      console.log(`Deleting team member ${member.id}:`, member.full_name || member.email);
      const response = await apiClient.deleteUser(member.id);
      
      console.log('Delete user response:', response);
      
      if (!response.success) {
        // Check for specific error message indicating foreign key constraint violation
        if (response.error?.includes('violate the required relation') || response.error?.includes('foreign key constraint')) {
          toast.error(
            `Cannot delete team member "${member.full_name || member.email}" because they have associated data (chats, listings, etc.). Please block the user instead or contact the backend team to implement cascading deletes.`,
            { duration: 10000 }
          );
        } else {
          throw new Error(response.error || "Failed to delete team member");
        }
        return;
      }

      toast.success(`✓ Team member "${member.full_name || member.email}" has been deleted successfully`);
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    } catch (error: any) {
      toast.error(error.message || "Failed to delete team member", { duration: 6000 });
      console.error("Error deleting team member:", error);
    }
  };

  const handleEdit = (member: TeamMember) => {
    setSelectedMember(member);
    setIsEditDialogOpen(true);
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      <AdminSidebar />
      
      <main className="flex-1">
        <AdminHeader />

        <div className="p-8">
          <div className="mb-6 grid grid-cols-3 gap-4">
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Available</p>
                  <p className="text-2xl font-bold">
                    {members?.filter(m => m.availability_status === 'available').length || 0}
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Busy</p>
                  <p className="text-2xl font-bold">
                    {members?.filter(m => m.availability_status === 'busy').length || 0}
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Offline</p>
                  <p className="text-2xl font-bold">
                    {members?.filter(m => m.availability_status === 'offline').length || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mb-6">
            <div className="relative w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, phone, username or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-muted/30 border-muted"
              />
            </div>
            <Button 
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Member
            </Button>
          </div>

          <div className="rounded-lg border border-border bg-card">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-accent" />
                <p className="text-sm text-muted-foreground">Loading team members...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <p className="text-destructive font-medium">Failed to load team members</p>
                <p className="text-sm text-muted-foreground">{error instanceof Error ? error.message : 'Unknown error'}</p>
                <Button 
                  onClick={() => refetch()} 
                  variant="outline"
                  className="mt-2"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <p className="text-muted-foreground">
                  {searchQuery ? "No team members match your search" : "No team members found"}
                </p>
                {searchQuery && (
                  <Button 
                    onClick={() => setSearchQuery("")} 
                    variant="outline"
                    size="sm"
                  >
                    Clear search
                  </Button>
                )}
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-muted-foreground">S No</TableHead>
                      <TableHead className="text-muted-foreground">User name</TableHead>
                      <TableHead className="text-muted-foreground">Email</TableHead>
                      <TableHead className="text-muted-foreground">Roles</TableHead>
                      <TableHead className="text-muted-foreground">Joined</TableHead>
                      <TableHead className="text-muted-foreground">Availability</TableHead>
                      <TableHead className="text-muted-foreground">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMembers.map((member, index) => (
                      <TableRow 
                        key={member.id}
                        className="border-border hover:bg-muted/5"
                      >
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={member.avatar_url || undefined} />
                              <AvatarFallback>
                                {member.full_name?.split(" ").map(n => n[0]).join("") || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{member.full_name || "Unknown"}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{member.email}</TableCell>
                        <TableCell className="capitalize">{member.role}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(member.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={member.availability_status}
                            onValueChange={(value) => handleAvailabilityChange(member.id, value)}
                          >
                            <SelectTrigger className="w-[140px]">
                              <div className="flex items-center gap-2">
                                <div 
                                  className={`w-2 h-2 rounded-full ${
                                    member.availability_status === 'available' 
                                      ? 'bg-green-500' 
                                      : member.availability_status === 'busy'
                                      ? 'bg-yellow-500'
                                      : 'bg-red-500'
                                  }`} 
                                />
                                <SelectValue />
                              </div>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="available">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-green-500" />
                                  Available
                                </div>
                              </SelectItem>
                              <SelectItem value="busy">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-yellow-500" />
                                  Busy
                                </div>
                              </SelectItem>
                              <SelectItem value="offline">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-red-500" />
                                  Offline
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent 
                              align="end"
                              className="w-40 bg-accent border-accent"
                            >
                              <DropdownMenuItem 
                                onClick={() => navigate(`/admin/team/${member.id}`)}
                                className="cursor-pointer"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleEdit(member)}
                                className="cursor-pointer"
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem className="cursor-pointer">
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Chat
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => {
                                  queryClient.invalidateQueries({ queryKey: ["team-members"] });
                                  toast.success("Team members refreshed");
                                }}
                                className="cursor-pointer"
                              >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Refresh
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDelete(member)}
                                className="cursor-pointer text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="flex items-center justify-between px-6 py-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    Showing {filteredMembers.length} of {members?.length || 0}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" disabled>
                      ←
                    </Button>
                    <Button 
                      size="icon"
                      className={currentPage === 1 ? "bg-accent text-accent-foreground" : ""}
                      onClick={() => setCurrentPage(1)}
                    >
                      1
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => setCurrentPage(2)}
                    >
                      2
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => setCurrentPage(3)}
                    >
                      3
                    </Button>
                    <Button variant="ghost" size="icon">
                      →
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      <AddMemberDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen}
      />
      <EditMemberDialog 
        open={isEditDialogOpen} 
        onOpenChange={setIsEditDialogOpen}
        member={selectedMember}
      />
    </div>
  );
}
