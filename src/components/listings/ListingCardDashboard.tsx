import { useState } from "react";
import { MoreVertical, Share2, ExternalLink, AlertCircle, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";

interface ListingCardDashboardProps {
  id: string;
  title: string;
  price: number;
  image_url?: string;
  status: "draft" | "published" | "archived";
  managed_by_ex: boolean;
  category?: string;
  created_at: string;
  requests_count: number;
  unread_messages_count: number;
  onUpdate: () => void;
}

export const ListingCardDashboard = ({
  id,
  title,
  price,
  image_url,
  status,
  managed_by_ex,
  category,
  created_at,
  requests_count,
  unread_messages_count,
  onUpdate,
}: ListingCardDashboardProps) => {
  const [isPublishing, setIsPublishing] = useState(false);

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      const response = await apiClient.updateListing(id, { status: "PUBLISH" });
      if (response.success) {
        toast.success("Listing published successfully");
        onUpdate();
      } else {
        toast.error("Failed to publish listing");
      }
    } catch (error) {
      toast.error("Failed to publish listing");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/listing/${id}`);
    toast.success("Link copied to clipboard");
  };

  const handleEdit = () => {
    window.location.href = `/listing/${id}/edit`;
  };

  const handleDelete = async () => {
    try {
      const response = await apiClient.deleteListing(id);
      if (response.success) {
        toast.success("Listing deleted successfully");
        onUpdate();
      } else {
        toast.error("Failed to delete listing");
      }
    } catch (error) {
      toast.error("Failed to delete listing");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  return (
    <div className="bg-card rounded-2xl overflow-hidden border border-border hover:shadow-lg transition-shadow">
      {/* Image */}
      <div className="relative h-48 bg-muted">
        {image_url ? (
          <img src={image_url} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            No image
          </div>
        )}

        {/* Top Actions */}
        <div className="absolute top-3 right-3 flex gap-2">
          <button
            onClick={handleShare}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
                <MoreVertical className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleEdit}>Edit Listing</DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                Delete Listing
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Badges - Show Managed by EX OR Category, not both */}
        <div className="absolute bottom-3 left-3 flex gap-2">
          {managed_by_ex ? (
            <Badge className="bg-[#D3FC50] text-black hover:bg-[#D3FC50]/90 font-semibold">
              <div className="w-4 h-4 border-2 border-black rounded-full flex items-center justify-center mr-1">
                <span className="text-[8px] font-bold">EX</span>
              </div>
              Managed by EX
            </Badge>
          ) : (
            category && (
              <Badge variant="secondary" className="bg-white/90 text-foreground">
                {category}
              </Badge>
            )
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title and Status */}
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-bold text-lg flex-1">{title}</h3>
          <Badge
            variant={status === "published" ? "default" : "secondary"}
            className={
              status === "published"
                ? "bg-blue-500 text-white"
                : "bg-red-100 text-red-700"
            }
          >
            {status === "published" ? "Published" : "Draft"}
          </Badge>
        </div>

        {/* Price */}
        <p className="text-2xl font-bold mb-3">${price.toLocaleString()}</p>

        {/* Alert/Messages */}
        {status === "draft" ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <AlertCircle className="w-4 h-4 text-orange-500" />
            <span>Edit or Publish your Listing</span>
          </div>
        ) : unread_messages_count > 0 ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <MessageSquare className="w-4 h-4 text-orange-500" />
            <span>{unread_messages_count} unanswered messages</span>
          </div>
        ) : null}

        {/* Meta Info */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <span>Created at:</span>
            <span className="font-medium">{formatDate(created_at)}</span>
          </div>
          <div className="flex items-center gap-1">
            <span>Requests:</span>
            <span className="font-medium">{requests_count}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {status === "draft" ? (
            <>
              <Button
                variant="outline"
                className="flex-1 rounded-full"
                onClick={handleEdit}
              >
                Edit
              </Button>
              <Button
                className="flex-1 rounded-full bg-[#D3FC50] text-black hover:bg-[#D3FC50]/90"
                onClick={handlePublish}
                disabled={isPublishing}
              >
                {isPublishing ? "Publishing..." : "Publish"}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                className="flex-1 rounded-full"
                onClick={() => toast.info("Push listing feature coming soon!")}
              >
                Push Listing
                <ExternalLink className="w-4 h-4 ml-1" />
              </Button>
              <Button
                className="flex-1 rounded-full bg-[#D3FC50] text-black hover:bg-[#D3FC50]/90"
                onClick={() => toast.info("View requests feature coming soon!")}
              >
                View Requests
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
