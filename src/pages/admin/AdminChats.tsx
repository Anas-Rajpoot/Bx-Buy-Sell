import { useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminConversationList } from "@/components/admin/chat/AdminConversationList";
import { AdminChatWindow } from "@/components/admin/chat/AdminChatWindow";
import { AdminChatDetails } from "@/components/admin/chat/AdminChatDetails";

const AdminChats = () => {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Conversation List */}
          <AdminConversationList 
            selectedConversationId={selectedConversationId}
            onSelectConversation={setSelectedConversationId}
          />

          {/* Chat Window */}
          {selectedConversationId ? (
            <>
              <AdminChatWindow conversationId={selectedConversationId} />
              <AdminChatDetails conversationId={selectedConversationId} />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              Select a conversation to view messages
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminChats;
