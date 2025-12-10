import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { StatCard } from "@/components/admin/StatCard";
import { VisitorsChart } from "@/components/admin/charts/VisitorsChart";
import { NewListingsChart } from "@/components/admin/charts/NewListingsChart";
import { RevenueChart } from "@/components/admin/charts/RevenueChart";
import { ListingsOverviewChart } from "@/components/admin/charts/ListingsOverviewChart";
import { useAdminDashboardStats } from "@/hooks/useAdminDashboardStats";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth();
  const { data: stats, isLoading: statsLoading } = useAdminDashboardStats();

  useEffect(() => {
    if (!authLoading) {
      checkAdminAccess();
    }
  }, [authLoading, isAuthenticated, user]);

  const checkAdminAccess = async () => {
    if (!isAuthenticated || !user) {
      navigate("/admin/login");
      return;
    }

    // Check if user has admin role
    if (user.role !== "ADMIN") {
      toast.error("Access denied. Admin privileges required.");
      await logout();
      navigate("/admin/login");
      return;
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user || user.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar />
      
      <main className="flex-1">
        <AdminHeader title="Dashboard" />

        <div className="p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Traffic Statistics</h2>
            <Select defaultValue="monthly">
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatCard 
              title="Total Users" 
              value={statsLoading ? "..." : stats?.totalUsers.toLocaleString() || "0"} 
              change="15%" 
              period="Monthly" 
            />
            <StatCard 
              title="Total Listings" 
              value={statsLoading ? "..." : stats?.totalListings.toLocaleString() || "0"} 
              change="15%" 
              period="Monthly" 
            />
            <StatCard 
              title="Blocked Users" 
              value={statsLoading ? "..." : stats?.blockedUsers.toLocaleString() || "0"} 
              change="15%" 
              period="Monthly" 
            />
            <StatCard 
              title="Finalized Deals" 
              value={statsLoading ? "..." : stats?.finalizedDeals.toLocaleString() || "0"} 
              change="15%" 
              period="Monthly" 
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <VisitorsChart />
            <NewListingsChart />
          </div>

          <RevenueChart />
          
          <ListingsOverviewChart />
        </div>
      </main>
    </div>
  );
}
