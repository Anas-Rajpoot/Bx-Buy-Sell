import { useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChatListTable } from "@/components/admin/chat-list/ChatListTable";

const AdminChatList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />

        {/* Manage Chat Section */}
        <div className="p-6 border-b bg-card">
          <h2 className="text-lg font-semibold mb-4">Manage Chat</h2>
          
          <div className="flex items-center justify-between">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
              <TabsList className="bg-transparent p-0 h-auto gap-2">
                <TabsTrigger 
                  value="all" 
                  className="data-[state=active]:bg-[#D4FF00] data-[state=active]:text-black rounded-lg px-6 py-2"
                >
                  All Chat
                </TabsTrigger>
                <TabsTrigger 
                  value="assigned"
                  className="data-[state=active]:bg-[#D4FF00] data-[state=active]:text-black rounded-lg px-6 py-2"
                >
                  Assigned
                </TabsTrigger>
                <TabsTrigger 
                  value="unassigned"
                  className="data-[state=active]:bg-[#D4FF00] data-[state=active]:text-black rounded-lg px-6 py-2"
                >
                  Unassigned
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by username, title, link, ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Time Filter */}
        <div className="px-6 py-3 border-b bg-card">
          <span className="text-sm font-medium text-muted-foreground">All Time</span>
        </div>

        {/* Chat Table */}
        <div className="flex-1 overflow-auto">
          <ChatListTable 
            searchQuery={searchQuery}
            filterType={activeTab}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminChatList;
