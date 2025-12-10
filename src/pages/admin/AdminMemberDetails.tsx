import { useNavigate, useParams } from "react-router-dom";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, MessageSquare, RefreshCw, Trash2, Edit, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

// Mock data - replace with actual API call
const mockMember = {
  id: "1",
  username: "Johnny",
  displayName: "John Doe",
  email: "JennyWilson62@gmail.com",
  password: "••••••••••",
  userId: "343fdft5",
  role: "Chat Agent",
  rating: 4.8,
  verified: true,
  avatar: null,
  stats: {
    managedListings: 104,
    managedChats: 208,
    activityLog: 1233,
  },
};

export default function AdminMemberDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <div className="flex min-h-screen w-full bg-background">
      <AdminSidebar />
      
      <main className="flex-1">
        <div className="border-b border-border bg-background">
          <div className="flex items-center justify-between px-8 py-4">
            <h1 className="text-2xl font-semibold">Member Details</h1>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon">
                <span className="sr-only">Notifications</span>
                🔔
              </Button>
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">Jhonson</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/admin/team")}
            className="mb-6 -ml-2 bg-accent/10 text-foreground hover:bg-accent/20"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Team Members
          </Button>

          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={mockMember.avatar || undefined} />
                  <AvatarFallback className="text-xl">
                    {mockMember.displayName.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-semibold">{mockMember.displayName}</h2>
                    {mockMember.verified && (
                      <CheckCircle className="h-5 w-5 text-accent" />
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-yellow-500">★★★★★</span>
                    <span className="text-sm text-muted-foreground ml-1">
                      ({mockMember.rating})
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  className="bg-accent text-accent-foreground hover:bg-accent/90"
                >
                  Settings
                </Button>
                <div className="flex flex-col gap-2 ml-2">
                  <Button size="icon" variant="outline" className="h-9 w-9 border-border">
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="outline" className="h-9 w-9 border-border">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="outline" className="h-9 w-9 border-border text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">Member Information</h3>
                  <Button size="icon" variant="ghost">
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <span className="text-muted-foreground w-32">Username</span>
                    <span className="font-medium">{mockMember.username}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-muted-foreground w-32">Email</span>
                    <span className="font-medium">{mockMember.email}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-muted-foreground w-32">Password</span>
                    <span className="font-medium">{mockMember.password}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-muted-foreground w-32">User ID</span>
                    <span className="font-medium">{mockMember.userId}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-muted-foreground w-32">Role</span>
                    <span className="font-medium">{mockMember.role}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div>
              <h3 className="text-lg font-semibold mb-4">Statistics</h3>
              <div className="grid grid-cols-3 gap-4">
                <Card className="bg-card border-border">
                  <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground mb-2">
                      Actually managed Listings
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-3xl font-bold">{mockMember.stats.managedListings}</span>
                      <Button 
                        size="sm"
                        className="bg-accent text-accent-foreground hover:bg-accent/90"
                      >
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground mb-2">
                      Actually managed Chats
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-3xl font-bold">{mockMember.stats.managedChats}</span>
                      <Button 
                        size="sm"
                        className="bg-accent text-accent-foreground hover:bg-accent/90"
                      >
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground mb-2">
                      Activity Log
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-3xl font-bold">{mockMember.stats.activityLog}</span>
                      <Button 
                        size="sm"
                        className="bg-accent text-accent-foreground hover:bg-accent/90"
                      >
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
