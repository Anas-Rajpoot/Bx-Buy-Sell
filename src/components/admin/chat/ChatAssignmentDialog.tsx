import { useState, useEffect } from "react";
// TODO: Implement chat assignment backend endpoints
// import { apiClient } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

interface TeamMember {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
}

interface ChatAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversationId: string;
  onAssigned: () => void;
}

export const ChatAssignmentDialog = ({
  open,
  onOpenChange,
  conversationId,
  onAssigned,
}: ChatAssignmentDialogProps) => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchTeamMembers();
    }
  }, [open]);

  const fetchTeamMembers = async () => {
    try {
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('user_id')
        .in('role', ['admin', 'moderator']);

      if (roleError) throw roleError;

      const userIds = roleData.map(r => r.user_id);

      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', userIds);

      if (profileError) throw profileError;

      setTeamMembers(profiles || []);
    } catch (error) {
      console.error('Error fetching team members:', error);
      toast({
        title: "Error",
        description: "Failed to fetch team members",
        variant: "destructive"
      });
    }
  };

  const handleAssign = async () => {
    if (!selectedMember) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('conversations')
        .update({ assigned_to: selectedMember })
        .eq('id', conversationId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Chat assigned successfully"
      });
      onAssigned();
      onOpenChange(false);
    } catch (error) {
      console.error('Error assigning chat:', error);
      toast({
        title: "Error",
        description: "Failed to assign chat",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Chat to Team Member</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Select value={selectedMember} onValueChange={setSelectedMember}>
            <SelectTrigger>
              <SelectValue placeholder="Select a team member" />
            </SelectTrigger>
            <SelectContent>
              {teamMembers.map((member) => (
                <SelectItem key={member.id} value={member.id}>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={member.avatar_url || ''} />
                      <AvatarFallback>{member.full_name?.[0] || 'T'}</AvatarFallback>
                    </Avatar>
                    <span>{member.full_name || 'Team Member'}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleAssign} 
            disabled={!selectedMember || loading}
            className="bg-[#D4FF00] hover:bg-[#D4FF00]/90 text-black"
          >
            Assign
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
