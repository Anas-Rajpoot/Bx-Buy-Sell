import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChatAnalyticsDashboard } from "@/components/admin/chat/ChatAnalyticsDashboard";
import { RoutingRulesDialog } from "@/components/admin/chat/RoutingRulesDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRoutingRules, useDeleteRoutingRule, useUpdateRoutingRule } from "@/hooks/useRoutingRules";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Trash2 } from "lucide-react";

const AdminChatAnalytics = () => {
  const { data: routingRules } = useRoutingRules();
  const deleteRule = useDeleteRoutingRule();
  const updateRule = useUpdateRoutingRule();

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />

        <div className="flex-1 overflow-auto">
          <Tabs defaultValue="analytics" className="w-full">
            <div className="border-b border-white/10 px-6 pt-4 pb-2">
              <TabsList variant="admin">
                <TabsTrigger variant="admin" value="analytics">Analytics</TabsTrigger>
                <TabsTrigger variant="admin" value="routing">Routing Rules</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="analytics" className="m-0 animate-fade-in">
              <ChatAnalyticsDashboard />
            </TabsContent>

            <TabsContent value="routing" className="m-0 p-6 animate-fade-in">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Auto-Assignment Rules</h2>
                  <RoutingRulesDialog />
                </div>

                <div className="grid gap-4">
                  {routingRules && routingRules.length > 0 ? (
                    routingRules.map((rule) => (
                      <Card key={rule.id}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <CardTitle className="text-lg">{rule.name}</CardTitle>
                              <Badge variant={rule.is_active ? "default" : "secondary"}>
                                {rule.is_active ? "Active" : "Inactive"}
                              </Badge>
                              <Badge variant="outline">Priority: {rule.priority}</Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={rule.is_active}
                                onCheckedChange={(checked) =>
                                  updateRule.mutate({ id: rule.id, is_active: checked })
                                }
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteRule.mutate(rule.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="text-sm text-muted-foreground space-y-1">
                            {rule.category_id && <p>Category: Specified</p>}
                            {rule.assign_to_role && <p>Assign to: {rule.assign_to_role}</p>}
                            {rule.assign_to_user_id && <p>Assign to: Specific user</p>}
                            {!rule.category_id && !rule.assign_to_role && !rule.assign_to_user_id && (
                              <p>Default rule: Auto-assign to least loaded available member</p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card>
                      <CardContent className="py-8 text-center text-muted-foreground">
                        No routing rules configured. Create one to enable auto-assignment.
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AdminChatAnalytics;