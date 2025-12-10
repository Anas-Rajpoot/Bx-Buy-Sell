import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Pencil, Trash2, MoreVertical, Facebook, Instagram, Twitter, Music, Pin, Linkedin, Youtube } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AddCategoryDialog } from "@/components/admin/content/AddCategoryDialog";
import { EditCategoryDialog } from "@/components/admin/content/EditCategoryDialog";
import { DeleteCategoryDialog } from "@/components/admin/content/DeleteCategoryDialog";
import { AddBrandQuestionDialog } from "@/components/admin/content/AddBrandQuestionDialog";
import { EditBrandQuestionDialog } from "@/components/admin/content/EditBrandQuestionDialog";
import { DeleteBrandQuestionDialog } from "@/components/admin/content/DeleteBrandQuestionDialog";
import { AddStatisticQuestionDialog } from "@/components/admin/content/AddStatisticQuestionDialog";
import { EditStatisticQuestionDialog } from "@/components/admin/content/EditStatisticQuestionDialog";
import { DeleteStatisticQuestionDialog } from "@/components/admin/content/DeleteStatisticQuestionDialog";
import { AddProductQuestionDialog } from "@/components/admin/content/AddProductQuestionDialog";
import { EditProductQuestionDialog } from "@/components/admin/content/EditProductQuestionDialog";
import { DeleteProductQuestionDialog } from "@/components/admin/content/DeleteProductQuestionDialog";
import { useManagementQuestions } from "@/hooks/useManagementQuestions";
import { AddManagementQuestionDialog } from "@/components/admin/content/AddManagementQuestionDialog";
import { EditManagementQuestionDialog } from "@/components/admin/content/EditManagementQuestionDialog";
import { DeleteManagementQuestionDialog } from "@/components/admin/content/DeleteManagementQuestionDialog";
import { AddToolDialog } from "@/components/admin/content/AddToolDialog";
import { EditToolDialog } from "@/components/admin/content/EditToolDialog";
import { DeleteToolDialog } from "@/components/admin/content/DeleteToolDialog";
import { AddAccountDialog } from "@/components/admin/content/AddAccountDialog";
import { EditAccountDialog } from "@/components/admin/content/EditAccountDialog";
import { DeleteAccountDialog } from "@/components/admin/content/DeleteAccountDialog";
import { AddAccountQuestionDialog } from "@/components/admin/content/AddAccountQuestionDialog";
import { EditAccountQuestionDialog } from "@/components/admin/content/EditAccountQuestionDialog";
import { DeleteAccountQuestionDialog } from "@/components/admin/content/DeleteAccountQuestionDialog";
import { useCategories } from "@/hooks/useCategories";
import { useBrandQuestions } from "@/hooks/useBrandQuestions";
import { useStatisticQuestions } from "@/hooks/useStatisticQuestions";
import { useProductQuestions } from "@/hooks/useProductQuestions";
import { useAdInformationQuestions } from "@/hooks/useAdInformationQuestions";
import { useHandoverQuestions } from "@/hooks/useHandoverQuestions";
import { AddAdInformationQuestionDialog } from "@/components/admin/content/AddAdInformationQuestionDialog";
import { EditAdInformationQuestionDialog } from "@/components/admin/content/EditAdInformationQuestionDialog";
import { DeleteAdInformationQuestionDialog } from "@/components/admin/content/DeleteAdInformationQuestionDialog";
import { AddHandoverQuestionDialog } from "@/components/admin/content/AddHandoverQuestionDialog";
import { EditHandoverQuestionDialog } from "@/components/admin/content/EditHandoverQuestionDialog";
import { DeleteHandoverQuestionDialog } from "@/components/admin/content/DeleteHandoverQuestionDialog";
import { useTools } from "@/hooks/useTools";
import { useAccounts } from "@/hooks/useAccounts";
import { useAccountQuestions } from "@/hooks/useAccountQuestions";
import { usePlans } from "@/hooks/usePlans";
import { AddPlanDialog } from "@/components/admin/content/AddPlanDialog";
import { EditPlanDialog } from "@/components/admin/content/EditPlanDialog";
import { DeletePlanDialog } from "@/components/admin/content/DeletePlanDialog";

const AdminContentManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [addCategoryOpen, setAddCategoryOpen] = useState(false);
  const [editCategoryOpen, setEditCategoryOpen] = useState(false);
  const [deleteCategoryOpen, setDeleteCategoryOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [addQuestionOpen, setAddQuestionOpen] = useState(false);
  const [editQuestionOpen, setEditQuestionOpen] = useState(false);
  const [deleteQuestionOpen, setDeleteQuestionOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const [addToolOpen, setAddToolOpen] = useState(false);
  const [editToolOpen, setEditToolOpen] = useState(false);
  const [deleteToolOpen, setDeleteToolOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState<any>(null);
  const [addStatisticQuestionOpen, setAddStatisticQuestionOpen] = useState(false);
  const [editStatisticQuestionOpen, setEditStatisticQuestionOpen] = useState(false);
  const [deleteStatisticQuestionOpen, setDeleteStatisticQuestionOpen] = useState(false);
  const [selectedStatisticQuestion, setSelectedStatisticQuestion] = useState<any>(null);
  const [addProductQuestionOpen, setAddProductQuestionOpen] = useState(false);
  const [editProductQuestionOpen, setEditProductQuestionOpen] = useState(false);
  const [deleteProductQuestionOpen, setDeleteProductQuestionOpen] = useState(false);
  const [selectedProductQuestion, setSelectedProductQuestion] = useState<any>(null);
  const [addManagementQuestionOpen, setAddManagementQuestionOpen] = useState(false);
  const [editManagementQuestionOpen, setEditManagementQuestionOpen] = useState(false);
  const [deleteManagementQuestionOpen, setDeleteManagementQuestionOpen] = useState(false);
  const [selectedManagementQuestion, setSelectedManagementQuestion] = useState<any>(null);
  const [addAccountOpen, setAddAccountOpen] = useState(false);
  const [editAccountOpen, setEditAccountOpen] = useState(false);
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [addAccountQuestionOpen, setAddAccountQuestionOpen] = useState(false);
  const [editAccountQuestionOpen, setEditAccountQuestionOpen] = useState(false);
  const [deleteAccountQuestionOpen, setDeleteAccountQuestionOpen] = useState(false);
  const [selectedAccountQuestion, setSelectedAccountQuestion] = useState<any>(null);
  const [addAdInformationQuestionOpen, setAddAdInformationQuestionOpen] = useState(false);
  const [editAdInformationQuestionOpen, setEditAdInformationQuestionOpen] = useState(false);
  const [deleteAdInformationQuestionOpen, setDeleteAdInformationQuestionOpen] = useState(false);
  const [selectedAdInformationQuestion, setSelectedAdInformationQuestion] = useState<any>(null);
  const [addHandoverQuestionOpen, setAddHandoverQuestionOpen] = useState(false);
  const [editHandoverQuestionOpen, setEditHandoverQuestionOpen] = useState(false);
  const [deleteHandoverQuestionOpen, setDeleteHandoverQuestionOpen] = useState(false);
  const [selectedHandoverQuestion, setSelectedHandoverQuestion] = useState<any>(null);
  const [addPlanOpen, setAddPlanOpen] = useState(false);
  const [editPlanOpen, setEditPlanOpen] = useState(false);
  const [deletePlanOpen, setDeletePlanOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  
  // Financials table state
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [financialData, setFinancialData] = useState<Record<string, Record<string, string>>>({
    "Gross Revenue": { "2023": "", "2024": "", "30.06.2025": "", "Forecast 2025": "" },
    "Net Revenue": { "2023": "", "2024": "", "30.06.2025": "", "Forecast 2025": "" },
    "Cost of Goods": { "2023": "", "2024": "", "30.06.2025": "", "Forecast 2025": "" },
    "Advertising costs": { "2023": "", "2024": "", "30.06.2025": "", "Forecast 2025": "" },
    "Freelancer/Employees": { "2023": "", "2024": "", "30.06.2025": "", "Forecast 2025": "" },
    "Transaction Costs": { "2023": "", "2024": "", "30.06.2025": "", "Forecast 2025": "" },
    "Other Expenses": { "2023": "", "2024": "", "30.06.2025": "", "Forecast 2025": "" },
  });
  
  const { data: categories, isLoading, error: categoriesError } = useCategories({ nocache: true });
  const { data: brandQuestions, isLoading: questionsLoading, error: brandQuestionsError } = useBrandQuestions();
  const { data: statisticQuestions, isLoading: statisticQuestionsLoading, error: statisticQuestionsError } = useStatisticQuestions();
  const { data: productQuestions, isLoading: productQuestionsLoading, error: productQuestionsError } = useProductQuestions();
  const { data: managementQuestions, isLoading: managementQuestionsLoading, error: managementQuestionsError } = useManagementQuestions();
  const { data: adInformationQuestions, isLoading: adInformationQuestionsLoading, error: adInformationQuestionsError } = useAdInformationQuestions();
  const { data: handoverQuestions, isLoading: handoverQuestionsLoading, error: handoverQuestionsError } = useHandoverQuestions();
  const { data: tools, isLoading: toolsLoading, error: toolsError } = useTools();
  const { data: accounts, isLoading: accountsLoading, error: accountsError } = useAccounts();
  const { data: accountQuestions, isLoading: accountQuestionsLoading, error: accountQuestionsError } = useAccountQuestions();
  const { data: plans, isLoading: plansLoading, error: plansError } = usePlans();
  const location = useLocation();
  const navigate = useNavigate();

  // Debug logging
  useEffect(() => {
    console.log('Categories loaded:', {
      isLoading,
      categories,
      categoriesCount: categories?.length,
      categoriesError,
      isArray: Array.isArray(categories),
    });
  }, [categories, isLoading, categoriesError]);

  useEffect(() => {
    console.log('Tools loaded:', {
      isLoading: toolsLoading,
      tools,
      toolsCount: tools?.length,
      toolsError,
      isArray: Array.isArray(tools),
    });
  }, [tools, toolsLoading, toolsError]);

  // Extract current tab from URL
  const currentPath = location.pathname.split('/').pop() || 'category';
  const [activeTab, setActiveTab] = useState(currentPath);

  useEffect(() => {
    const path = location.pathname.split('/').pop() || 'category';
    if (location.pathname === '/admin/content' || location.pathname === '/admin/content/') {
      navigate('/admin/content/category', { replace: true });
    } else {
      setActiveTab(path);
    }
  }, [location.pathname, navigate]);

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar />
      
      <main className="flex-1">
        <AdminHeader />

        <div className="p-8 space-y-6">
          <h1 className="text-2xl font-bold text-white mb-6">Content Management</h1>
            
            {/* Category Section */}
            {activeTab === 'category' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-foreground">Category</h2>
                  <div className="flex items-center gap-4">
                    <div className="relative w-80">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-background border-border"
                      />
                    </div>
                    <Button
                      onClick={() => setAddCategoryOpen(true)}
                      className="bg-accent hover:bg-accent/90 text-black font-semibold rounded-lg px-8 h-10"
                    >
                      Add Category
                    </Button>
                  </div>
                </div>

                <div className="bg-card rounded-2xl p-8 border border-border">
                  <h3 className="text-xl font-bold text-foreground mb-8">Added Categories</h3>
                  
                  {isLoading ? (
                    <div className="text-muted-foreground">Loading categories...</div>
                  ) : categoriesError ? (
                    <div className="text-destructive text-center py-12">
                      <p>Error loading categories: {categoriesError.message}</p>
                      <p className="text-xs mt-2 text-muted-foreground">Check browser console for details.</p>
                    </div>
                  ) : categories && Array.isArray(categories) && categories.length > 0 ? (
                    <>
                      <div className="text-sm text-muted-foreground mb-4">
                        Found {categories.length} categor{categories.length === 1 ? 'y' : 'ies'}
                      </div>
                      <div className="grid grid-cols-4" style={{ columnGap: '10px', rowGap: '10px' }}>
                        {categories
                          .filter((category: any) => 
                            !searchQuery || category.name?.toLowerCase().includes(searchQuery.toLowerCase())
                          )
                          .map((category: any) => (
                            <div
                              key={category.id}
                              className="relative bg-[#FAFAFA] rounded-2xl flex flex-col items-center gap-4 group transition-all hover:shadow-lg"
                              style={{ 
                                width: '239.51px', 
                                height: '153.85px',
                                paddingTop: '22px',
                                paddingBottom: '22px',
                                paddingLeft: '25px',
                                paddingRight: '25px'
                              }}
                            >
                              <div className="absolute top-2 right-2 z-10">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-8 w-8 bg-white border border-border hover:bg-accent/20 rounded-full"
                                    >
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="bg-background border-border">
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setSelectedCategory(category);
                                        setEditCategoryOpen(true);
                                      }}
                                      className="cursor-pointer text-foreground hover:bg-accent/20"
                                    >
                                      <Pencil className="h-4 w-4 mr-2" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setSelectedCategory(category);
                                        setDeleteCategoryOpen(true);
                                      }}
                                      className="cursor-pointer text-destructive hover:bg-destructive/20"
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                              
                              <div className="flex flex-col items-center justify-center gap-4 flex-1">
                                {category.image_path ? (
                                  <div 
                                    className="w-16 h-16 rounded-full flex items-center justify-center transition-transform group-hover:scale-105"
                                    style={{ 
                                      backgroundColor: 'rgba(156, 163, 175, 0.15)',
                                      borderRadius: '16.78px'
                                    }}
                                  >
                                    <img 
                                      src={category.image_path} 
                                      alt={category.name}
                                      className="w-10 h-10 object-contain"
                                    />
                                  </div>
                                ) : (
                                  <div 
                                    className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center transition-transform group-hover:scale-105"
                                    style={{ borderRadius: '16.78px' }}
                                  >
                                    <span className="text-2xl font-bold text-foreground">
                                      {category.name.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                )}
                                <span className="text-black font-semibold text-base text-center leading-tight">{category.name}</span>
                              </div>
                            </div>
                          ))}
                      </div>
                    </>
                  ) : (
                    <div className="text-muted-foreground text-center py-12">
                      {categoriesError ? (
                        <div>
                          <p className="text-destructive">Error: {categoriesError.message}</p>
                          <p className="text-xs mt-2">Check browser console for details.</p>
                        </div>
                      ) : categories === undefined ? (
                        <div>
                          <p>No categories found.</p>
                          <p className="text-xs mt-2">Check browser console for API response details.</p>
                        </div>
                      ) : (
                        "No categories added yet. Click \"Add Category\" to create one."
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Brand Information Section */}
            {activeTab === 'brand-info' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-foreground">Brand Information</h2>
                  <Button
                    onClick={() => setAddQuestionOpen(true)}
                    className="bg-accent hover:bg-accent/90 text-black font-semibold rounded-lg px-8 h-10"
                  >
                    Add New Question
                  </Button>
                </div>

                <div className="bg-card rounded-2xl p-8 border border-border">
                  <h3 className="text-xl font-bold text-foreground mb-8">Added Brand Information Questions</h3>
                  
                  {questionsLoading ? (
                    <div className="text-muted-foreground">Loading questions...</div>
                  ) : brandQuestionsError ? (
                    <div className="text-destructive text-center py-12">
                      <p>Error loading questions: {brandQuestionsError.message}</p>
                      <p className="text-xs mt-2 text-muted-foreground">Check browser console for details.</p>
                    </div>
                  ) : brandQuestions && Array.isArray(brandQuestions) && brandQuestions.length > 0 ? (
                    <div className="space-y-4">
                      {brandQuestions.map((question: any) => {
                        // Map backend types to display labels
                        const getTypeLabel = (type: string) => {
                          const typeMap: Record<string, string> = {
                            'TEXT': 'Text',
                            'NUMBER': 'Number',
                            'DATE': 'Date',
                            'SELECT': 'Select',
                            'TEXTAREA': 'Long Text',
                            'URL': 'Link',
                            'BOOLEAN': 'Boolean',
                            'FILE': 'File',
                            'PHOTO': 'Photo',
                          };
                          return typeMap[type] || type;
                        };
                        
                        return (
                        <div
                          key={question.id}
                          className="bg-[#FAFAFA] rounded-2xl p-6 flex items-center justify-between"
                        >
                          <div className="flex-1">
                            <h4 className="text-black font-semibold text-lg mb-1">{question.question}</h4>
                            <p className="text-muted-foreground text-sm">
                              Type: {getTypeLabel(question.answer_type)}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => {
                                setSelectedQuestion(question);
                                setEditQuestionOpen(true);
                              }}
                              className="bg-accent hover:bg-accent/90 text-black font-semibold rounded-full px-6 h-10"
                            >
                              Edit
                            </Button>
                            <Button
                              onClick={() => {
                                setSelectedQuestion(question);
                                setDeleteQuestionOpen(true);
                              }}
                              variant="destructive"
                              className="rounded-full px-6 h-10"
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-muted-foreground text-center py-12">
                      No questions added yet. Click "Add New Question" to create one.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tools Section */}
            {activeTab === 'tools' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-foreground">Tools</h2>
                  <div className="flex items-center gap-4">
                    <div className="relative w-80">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-background border-border"
                      />
                    </div>
                    <Button
                      onClick={() => setAddToolOpen(true)}
                      className="bg-accent hover:bg-accent/90 text-black font-semibold rounded-lg px-8 h-10"
                    >
                      Add Tools
                    </Button>
                  </div>
                </div>

                <div className="bg-card rounded-2xl p-8 border border-border">
                  <h3 className="text-xl font-bold text-foreground mb-8">Added Tools</h3>
                  
                  {toolsLoading ? (
                    <div className="text-muted-foreground">Loading tools...</div>
                  ) : toolsError ? (
                    <div className="text-destructive text-center py-12">
                      <p>Error loading tools: {toolsError.message}</p>
                      <p className="text-xs mt-2 text-muted-foreground">Check browser console for details.</p>
                    </div>
                  ) : tools && Array.isArray(tools) && tools.length > 0 ? (
                    <div className="grid grid-cols-4" style={{ columnGap: '10px', rowGap: '10px' }}>
                      {tools
                        .filter((tool: any) => 
                          tool.name.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .map((tool: any) => (
                        <div
                          key={tool.id}
                          className="relative bg-[#FAFAFA] rounded-2xl flex flex-col items-center gap-4 group transition-all hover:shadow-lg"
                          style={{ 
                            width: '239.51px', 
                            height: '153.85px',
                            paddingTop: '22px',
                            paddingBottom: '22px',
                            paddingLeft: '25px',
                            paddingRight: '25px'
                          }}
                        >
                          <div className="absolute top-2 right-2 z-10">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 bg-white border border-border hover:bg-accent/20 rounded-full"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-background border-border">
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedTool(tool);
                                    setEditToolOpen(true);
                                  }}
                                  className="cursor-pointer text-foreground hover:bg-accent/20"
                                >
                                  <Pencil className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedTool(tool);
                                    setDeleteToolOpen(true);
                                  }}
                                  className="cursor-pointer text-destructive hover:bg-destructive/20"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          
                          <div className="flex flex-col items-center justify-center gap-4 flex-1">
                            {tool.image_path ? (
                              <div 
                                className="w-16 h-16 flex items-center justify-center transition-transform group-hover:scale-105"
                              >
                                <img 
                                  src={tool.image_path} 
                                  alt={tool.name}
                                  className="w-full h-full object-contain"
                                />
                              </div>
                            ) : (
                              <div 
                                className="w-16 h-16 rounded-full flex items-center justify-center bg-muted"
                              >
                                <span className="text-2xl">{tool.name[0]}</span>
                              </div>
                            )}
                            
                            <span className="font-medium text-center text-sm text-foreground">
                              {tool.name}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-muted-foreground text-center py-8">
                      {toolsError ? (
                        <div>
                          <p className="text-destructive">Error: {toolsError.message}</p>
                          <p className="text-xs mt-2">Check browser console for details.</p>
                        </div>
                      ) : (
                        "No tools found. Click \"Add Tools\" to create your first tool."
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Financials Section */}
            {activeTab === 'financials' && (() => {
              const rows = [
                "Gross Revenue",
                "Net Revenue",
                "Cost of Goods",
                "Advertising costs",
                "Freelancer/Employees",
                "Transaction Costs",
                "Other Expenses"
              ];
              const columns = ["2023", "2024", "30.06.2025", "Forecast 2025"];

              const handleCellChange = (row: string, col: string, value: string) => {
                setFinancialData(prev => ({
                  ...prev,
                  [row]: {
                    ...prev[row],
                    [col]: value
                  }
                }));
              };

              const calculateNetProfit = (col: string) => {
                let total = 0;
                rows.forEach(row => {
                  const value = parseFloat(financialData[row]?.[col] || "0");
                  if (row === "Gross Revenue" || row === "Net Revenue") {
                    total += value;
                  } else {
                    total -= value;
                  }
                });
                return total.toFixed(2);
              };

              return (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-foreground">Financials</h2>
                    <Button
                      onClick={() => setIsEditMode(!isEditMode)}
                      className="bg-accent hover:bg-accent/90 text-black font-semibold rounded-lg px-8 h-10"
                    >
                      {isEditMode ? "Save Table" : "Edit Table"}
                    </Button>
                  </div>

                  <div className="bg-black rounded-2xl p-8">
                    <h3 className="text-xl font-bold text-white mb-6">Profit & Loss</h3>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr>
                            <th className="text-left py-3 px-4 font-medium text-black" style={{ backgroundColor: '#c6fe1f' }}>Zeitraum</th>
                            {columns.map(col => (
                              <th key={col} className="text-center py-3 px-4 font-medium text-black" style={{ backgroundColor: '#c6fe1f' }}>
                                {col}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {rows.map((row, rowIndex) => {
                            const bgColor = row === "Gross Revenue" 
                              ? "#424242" 
                              : "#f3f8e8";
                            const textColor = row === "Gross Revenue" ? "text-white" : "text-black";
                            const isSelected = selectedRow === rowIndex;
                            
                            return (
                              <tr 
                                key={row}
                                className={`${isSelected ? "ring-2 ring-accent" : ""} cursor-pointer transition-all`}
                                style={{ backgroundColor: bgColor }}
                                onClick={() => setSelectedRow(rowIndex)}
                                onMouseEnter={(e) => {
                                  if (!isSelected) {
                                    e.currentTarget.style.opacity = "0.8";
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.opacity = "1";
                                }}
                              >
                                <td className={`py-3 px-4 font-medium ${textColor}`} style={{ backgroundColor: bgColor }}>{row}</td>
                                {columns.map(col => (
                                  <td key={col} className={`py-3 px-4 text-center ${textColor}`} style={{ backgroundColor: bgColor }}>
                                    {isEditMode ? (
                                      <Input
                                        type="number"
                                        value={financialData[row]?.[col] || ""}
                                        onChange={(e) => handleCellChange(row, col, e.target.value)}
                                        className={`w-full bg-transparent border-accent/50 text-center focus:border-accent ${textColor}`}
                                        style={{ backgroundColor: bgColor }}
                                        onClick={(e) => e.stopPropagation()}
                                      />
                                    ) : (
                                      <span>{financialData[row]?.[col] || "-"}</span>
                                    )}
                                  </td>
                                ))}
                              </tr>
                            );
                          })}
                          <tr style={{ backgroundColor: '#f3f8e8' }}>
                            <td className="py-3 px-4 text-black">
                              <button 
                                onClick={() => {
                                  // TODO: Add new row functionality
                                  console.log("Add new row");
                                }}
                                className="text-accent hover:text-accent/80 font-medium"
                              >
                                Add+
                              </button>
                            </td>
                            {columns.map(col => (
                              <td key={col} className="py-3 px-4 text-center text-black" style={{ backgroundColor: '#f3f8e8' }}>-</td>
                            ))}
                          </tr>
                          <tr style={{ backgroundColor: '#c6fe1f' }}>
                            <td className="py-3 px-4 font-semibold text-black" style={{ backgroundColor: '#c6fe1f' }}>Net Profit</td>
                            {columns.map(col => {
                              const profit = calculateNetProfit(col);
                              return (
                                <td key={col} className="py-3 px-4 text-center font-semibold text-black" style={{ backgroundColor: '#c6fe1f' }}>
                                  {profit !== "0.00" ? profit : "-"}
                                </td>
                              );
                            })}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Additional Infos Section with Statistics Sub-tab */}
            {activeTab === 'additional-infos' && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-2xl font-bold text-foreground mb-6">Additional Infos</h2>
                
                <Tabs defaultValue="statistics" className="w-full">
                  <TabsList variant="admin" className="bg-[#1a1a1a] border-b border-[#2a2a2a] rounded-none w-full justify-start h-auto p-0">
                    <TabsTrigger variant="admin" value="statistics" className="rounded-none data-[state=active]:bg-[#2a2a2a]">
                      Statistics
                    </TabsTrigger>
                    <TabsTrigger variant="admin" value="products" className="rounded-none data-[state=active]:bg-[#2a2a2a]">
                      Products
                    </TabsTrigger>
                    <TabsTrigger variant="admin" value="management" className="rounded-none data-[state=active]:bg-[#2a2a2a]">
                      Management
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="statistics" className="mt-6">
                    <div className="space-y-6">
                      <div className="flex items-center justify-end">
                        <Button
                          onClick={() => setAddStatisticQuestionOpen(true)}
                          className="bg-accent hover:bg-accent/90 text-black font-semibold rounded-lg px-8 h-10"
                        >
                          Add New Question
                        </Button>
                      </div>

                      <div className="bg-card rounded-2xl p-8 border border-border">
                        <h3 className="text-xl font-bold text-foreground mb-8">Added Statistic Questions</h3>
                        
                        {statisticQuestionsLoading ? (
                          <div className="text-muted-foreground">Loading questions...</div>
                        ) : statisticQuestions && Array.isArray(statisticQuestions) && statisticQuestions.length > 0 ? (
                          <div className="space-y-4">
                            {statisticQuestions.map((question: any) => (
                              <div
                                key={question.id}
                                className="bg-[#FAFAFA] rounded-2xl p-6 flex items-center justify-between"
                              >
                                <div className="flex-1">
                                  <h4 className="text-black font-semibold text-lg mb-1">{question.question}</h4>
                                  <p className="text-muted-foreground text-sm">
                                    Type: {question.answer_type}
                                  </p>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    onClick={() => {
                                      setSelectedStatisticQuestion(question);
                                      setEditStatisticQuestionOpen(true);
                                    }}
                                    className="bg-accent hover:bg-accent/90 text-black font-semibold rounded-full px-6 h-10"
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    onClick={() => {
                                      setSelectedStatisticQuestion(question);
                                      setDeleteStatisticQuestionOpen(true);
                                    }}
                                    variant="destructive"
                                    className="rounded-full px-6 h-10"
                                  >
                                    Delete
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-muted-foreground text-center py-12">
                            No questions added yet. Click "Add New Question" to create one.
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="products" className="mt-6">
                    <div className="space-y-6">
                      <div className="flex items-center justify-end">
                        <Button
                          onClick={() => setAddProductQuestionOpen(true)}
                          className="bg-accent hover:bg-accent/90 text-black font-semibold rounded-lg px-8 h-10"
                        >
                          Add New Question
                        </Button>
                      </div>

                      <div className="bg-card rounded-2xl p-8 border border-border">
                        <h3 className="text-xl font-bold text-foreground mb-8">Added Product Questions</h3>
                        
                        {productQuestionsLoading ? (
                          <div className="text-muted-foreground">Loading questions...</div>
                        ) : productQuestions && Array.isArray(productQuestions) && productQuestions.length > 0 ? (
                          <div className="space-y-4">
                            {productQuestions.map((question: any) => (
                              <div
                                key={question.id}
                                className="bg-[#FAFAFA] rounded-2xl p-6 flex items-center justify-between"
                              >
                                <div className="flex-1">
                                  <h4 className="text-black font-semibold text-lg mb-1">{question.question}</h4>
                                  <p className="text-muted-foreground text-sm">
                                    Type: {question.answer_type}
                                  </p>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    onClick={() => {
                                      setSelectedProductQuestion(question);
                                      setEditProductQuestionOpen(true);
                                    }}
                                    className="bg-accent hover:bg-accent/90 text-black font-semibold rounded-full px-6 h-10"
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    onClick={() => {
                                      setSelectedProductQuestion(question);
                                      setDeleteProductQuestionOpen(true);
                                    }}
                                    variant="destructive"
                                    className="rounded-full px-6 h-10"
                                  >
                                    Delete
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-muted-foreground text-center py-12">
                            No questions added yet. Click "Add New Question" to create one.
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="management" className="mt-6">
                    <div className="space-y-6">
                      <div className="flex items-center justify-end">
                        <Button
                          onClick={() => setAddManagementQuestionOpen(true)}
                          className="bg-accent hover:bg-accent/90 text-black font-semibold rounded-lg px-8 h-10"
                        >
                          Add New Question
                        </Button>
                      </div>

                      <div className="bg-card rounded-2xl p-8 border border-border">
                        <h3 className="text-xl font-bold text-foreground mb-8">Added Management Questions</h3>
                        
                        {managementQuestionsLoading ? (
                          <div className="text-muted-foreground">Loading questions...</div>
                        ) : managementQuestions && Array.isArray(managementQuestions) && managementQuestions.length > 0 ? (
                          <div className="space-y-4">
                            {managementQuestions.map((question: any) => (
                              <div
                                key={question.id}
                                className="bg-[#FAFAFA] rounded-2xl p-6 flex items-center justify-between"
                              >
                                <div className="flex-1">
                                  <h4 className="text-black font-semibold text-lg mb-1">{question.question}</h4>
                                  <p className="text-muted-foreground text-sm">
                                    Type: {question.answer_type}
                                  </p>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    onClick={() => {
                                      setSelectedManagementQuestion(question);
                                      setEditManagementQuestionOpen(true);
                                    }}
                                    className="bg-accent hover:bg-accent/90 text-black font-semibold rounded-full px-6 h-10"
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    onClick={() => {
                                      setSelectedManagementQuestion(question);
                                      setDeleteManagementQuestionOpen(true);
                                    }}
                                    variant="destructive"
                                    className="rounded-full px-6 h-10"
                                  >
                                    Delete
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-muted-foreground text-center py-12">
                            No questions added yet. Click "Add New Question" to create one.
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}

            {/* Accounts Section */}
            {activeTab === 'accounts' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-foreground">Social Media Accounts</h2>
                  <Button
                    onClick={() => setAddAccountOpen(true)}
                    className="bg-accent hover:bg-accent/90 text-black font-semibold rounded-lg px-8 h-10"
                  >
                    Add New Social Account
                  </Button>
                </div>

                <div className="bg-card rounded-2xl p-8 border border-border">
                  <h3 className="text-xl font-bold text-foreground mb-8">Enabled Social Media Platforms</h3>
                  
                  {accountsLoading ? (
                    <div className="text-muted-foreground">Loading platforms...</div>
                  ) : accounts && Array.isArray(accounts) && accounts.length > 0 ? (
                    <div className="space-y-4">
                      {accounts.map((account: any) => {
                        const getPlatformIcon = () => {
                          switch (account.platform.toLowerCase()) {
                            case "facebook": return <Facebook className="w-5 h-5" />;
                            case "instagram": return <Instagram className="w-5 h-5" />;
                            case "twitter": return <Twitter className="w-5 h-5" />;
                            case "tiktok": return <Music className="w-5 h-5" />;
                            case "pinterest": return <Pin className="w-5 h-5" />;
                            case "linkedin": return <Linkedin className="w-5 h-5" />;
                            case "youtube": return <Youtube className="w-5 h-5" />;
                            default: return <span>🌐</span>;
                          }
                        };

                        return (
                          <div
                            key={account.id}
                            className="bg-[#FAFAFA] rounded-2xl p-6 flex items-center gap-4"
                          >
                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                              {getPlatformIcon()}
                            </div>
                            <div className="flex-1">
                              <h4 className="text-black font-semibold text-lg mb-1 capitalize">{account.platform}</h4>
                              <p className="text-muted-foreground text-sm">Users will enter their account links for this platform</p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => {
                                  setSelectedAccount(account);
                                  setEditAccountOpen(true);
                                }}
                                className="bg-accent hover:bg-accent/90 text-black font-semibold rounded-full px-6 h-10"
                              >
                                Edit
                              </Button>
                              <Button
                                onClick={() => {
                                  setSelectedAccount(account);
                                  setDeleteAccountOpen(true);
                                }}
                                variant="destructive"
                                className="rounded-full px-6 h-10"
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-muted-foreground text-center py-12">
                      No platforms enabled yet. Click "Add New Social Account" to enable a platform.
                    </div>
                  )}
                </div>

                {/* Account Questions Section */}
                <div className="flex items-center justify-between mb-6 mt-8">
                  <h2 className="text-2xl font-bold text-foreground">Account Questions</h2>
                  <Button
                    onClick={() => setAddAccountQuestionOpen(true)}
                    className="bg-accent hover:bg-accent/90 text-black font-semibold rounded-lg px-8 h-10"
                  >
                    Add New Question
                  </Button>
                </div>

                <div className="bg-card rounded-2xl p-8 border border-border">
                  <h3 className="text-xl font-bold text-foreground mb-8">Added Account Questions</h3>
                  
                  {accountQuestionsLoading ? (
                    <div className="text-muted-foreground">Loading questions...</div>
                  ) : accountQuestionsError ? (
                    <div className="text-destructive text-center py-12">
                      <p>Error loading account questions: {accountQuestionsError.message}</p>
                      <p className="text-xs mt-2 text-muted-foreground">Check browser console for details.</p>
                    </div>
                  ) : accountQuestions && accountQuestions.length > 0 ? (
                    <div className="space-y-3">
                      {accountQuestions.map((question: any) => {
                        const getTypeLabel = (type: string) => {
                          const typeMap: Record<string, string> = {
                            'PHOTO': 'Photo Upload',
                            'FILE': 'File Upload',
                            'NUMBER': 'Number',
                            'TEXT': 'Text',
                            'TEXTAREA': 'Text Area',
                            'DATE': 'Date',
                            'BOOLEAN': 'Yes / No',
                            'YESNO': 'Yes / No',
                            'SELECT': 'Dropdown',
                          };
                          return typeMap[type] || type;
                        };

                        return (
                          <div
                            key={question.id}
                            className="bg-white rounded-xl p-6 border border-border flex items-center justify-between hover:border-accent/50 transition-colors"
                          >
                            <div className="flex-1">
                              <h4 className="text-base font-medium text-foreground">
                                {question.question}
                              </h4>
                            </div>
                            <div className="flex items-center gap-3">
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedAccountQuestion(question);
                                  setEditAccountQuestionOpen(true);
                                }}
                                className="bg-accent hover:bg-accent/90 text-black font-medium rounded-lg h-9 px-6"
                              >
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  setSelectedAccountQuestion(question);
                                  setDeleteAccountQuestionOpen(true);
                                }}
                                className="bg-destructive hover:bg-destructive/90 text-white font-medium rounded-lg h-9 px-6"
                              >
                                Delete
                              </Button>
                              <div className="text-sm text-muted-foreground min-w-[120px] text-right">
                                Type: <span className="font-medium text-foreground">{getTypeLabel(question.answer_type)}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      No account questions added yet. Click "Add New Question" to get started.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Ad Informations Section */}
            {activeTab === 'ad-informations' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-foreground">Ad Informations</h2>
                  <Button
                    onClick={() => setAddAdInformationQuestionOpen(true)}
                    className="bg-accent hover:bg-accent/90 text-black font-semibold rounded-lg px-8 h-10"
                  >
                    Add New Question
                  </Button>
                </div>

                <div className="bg-card rounded-2xl p-8 border border-border">
                  <h3 className="text-xl font-bold text-foreground mb-8">Added Ad Information Questions</h3>
                  
                  {adInformationQuestionsLoading ? (
                    <div className="text-muted-foreground">Loading questions...</div>
                  ) : adInformationQuestionsError ? (
                    <div className="text-destructive text-center py-12">
                      <p>Error loading ad information questions: {adInformationQuestionsError.message}</p>
                      <p className="text-xs mt-2 text-muted-foreground">Check browser console for details.</p>
                    </div>
                  ) : adInformationQuestions && adInformationQuestions.length > 0 ? (
                    <div className="space-y-3">
                      {adInformationQuestions.map((question: any) => {
                        const getTypeLabel = (type: string) => {
                          const typeMap: Record<string, string> = {
                            'PHOTO': 'Photo Upload',
                            'FILE': 'File Upload',
                            'NUMBER': 'Number',
                            'TEXT': 'Text',
                            'TEXTAREA': 'Text',
                            'DATE': 'Date',
                            'BOOLEAN': 'Yes / No',
                            'YESNO': 'Yes / No',
                            'SELECT': 'Dropdown',
                          };
                          return typeMap[type] || type;
                        };

                        return (
                          <div
                            key={question.id}
                            className="bg-white rounded-xl p-6 border border-border flex items-center justify-between hover:border-accent/50 transition-colors"
                          >
                            <div className="flex-1">
                              <h4 className="text-base font-medium text-foreground">
                                {question.question}
                              </h4>
                            </div>
                            <div className="flex items-center gap-3">
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedAdInformationQuestion(question);
                                  setEditAdInformationQuestionOpen(true);
                                }}
                                className="bg-accent hover:bg-accent/90 text-black font-medium rounded-lg h-9 px-6"
                              >
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  setSelectedAdInformationQuestion(question);
                                  setDeleteAdInformationQuestionOpen(true);
                                }}
                                className="bg-destructive hover:bg-destructive/90 text-white font-medium rounded-lg h-9 px-6"
                              >
                                Delete
                              </Button>
                              <div className="text-sm text-muted-foreground min-w-[120px] text-right">
                                Type: <span className="font-medium text-foreground">{getTypeLabel(question.answer_type)}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      No ad information questions added yet. Click "Add New Question" to get started.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Handover Section */}
            {activeTab === 'handover' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-foreground">Handovers Questions</h2>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Search by name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-64 bg-muted/50 border-border"
                      />
                    </div>
                    <Button
                      onClick={() => setAddHandoverQuestionOpen(true)}
                      className="bg-accent hover:bg-accent/90 text-black font-semibold rounded-lg px-8 h-10"
                    >
                      Add New Question
                    </Button>
                  </div>
                </div>

                <div className="bg-card rounded-2xl p-8 border border-border">
                  <h3 className="text-xl font-bold text-foreground mb-8">Added Handovers Questions</h3>
                  
                  {handoverQuestionsLoading ? (
                    <div className="text-muted-foreground">Loading questions...</div>
                  ) : handoverQuestionsError ? (
                    <div className="text-destructive text-center py-12">
                      <p>Error loading handover questions: {handoverQuestionsError.message}</p>
                      <p className="text-xs mt-2 text-muted-foreground">Check browser console for details.</p>
                    </div>
                  ) : handoverQuestions && handoverQuestions.length > 0 ? (
                    <div className="space-y-3">
                      {handoverQuestions
                        .filter((question: any) => 
                          question.question?.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .map((question: any) => {
                          const getTypeLabel = (type: string) => {
                            const typeMap: Record<string, string> = {
                              'PHOTO': 'Photo Upload',
                              'FILE': 'File Upload',
                              'NUMBER': 'Number',
                              'TEXT': 'Text',
                              'TEXTAREA': 'Text',
                              'DATE': 'Date',
                              'BOOLEAN': 'Yes / No',
                              'YESNO': 'Yes / No',
                              'SELECT': 'Dropdown',
                              'CHECKBOX_GROUP': 'Checkbox Group',
                            };
                            return typeMap[type] || type;
                          };

                          return (
                            <div
                              key={question.id}
                              className="bg-white rounded-xl p-6 border border-border flex items-center justify-between hover:border-accent/50 transition-colors relative"
                            >
                              <div className="flex-1 pr-4">
                                <h4 className="text-base font-medium text-foreground">
                                  {question.question}
                                </h4>
                              </div>
                              <div className="absolute top-4 right-4">
                                <span className="text-sm text-muted-foreground">
                                  Type : <span className="font-medium text-foreground">{getTypeLabel(question.answer_type)}</span>
                                </span>
                              </div>
                              <div className="flex gap-2 ml-auto">
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setSelectedHandoverQuestion(question);
                                    setEditHandoverQuestionOpen(true);
                                  }}
                                  className="bg-accent hover:bg-accent/90 text-black font-medium rounded-lg h-9 px-6"
                                >
                                  Edit
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => {
                                    setSelectedHandoverQuestion(question);
                                    setDeleteHandoverQuestionOpen(true);
                                  }}
                                  className="bg-destructive hover:bg-destructive/90 text-white font-medium rounded-lg h-9 px-6"
                                >
                                  Delete
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      No handover questions added yet. Click "Add New Question" to get started.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Packages Section */}
            {activeTab === 'packages' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">Plans</h2>
                    <h3 className="text-xl font-semibold text-foreground mt-2">Packages</h3>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Search by name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-64 bg-muted/50 border-border"
                      />
                    </div>
                    <Button
                      onClick={() => setAddPlanOpen(true)}
                      className="bg-accent hover:bg-accent/90 text-black font-semibold rounded-lg px-8 h-10"
                    >
                      Add New Package
                    </Button>
                  </div>
                </div>

                <div className="bg-card rounded-2xl p-8 border border-border">
                  <h3 className="text-xl font-bold text-foreground mb-8">Added Packages</h3>
                  
                  {plansLoading ? (
                    <div className="text-muted-foreground">Loading packages...</div>
                  ) : plansError ? (
                    <div className="text-destructive text-center py-12">
                      <p>Error loading packages: {plansError.message}</p>
                      <p className="text-xs mt-2 text-muted-foreground">Check browser console for details.</p>
                    </div>
                  ) : plans && plans.length > 0 ? (
                    <div className="space-y-4">
                      {plans
                        .filter((plan: any) => 
                          plan.title?.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .map((plan: any) => (
                          <div
                            key={plan.id}
                            className="bg-white rounded-xl p-6 border border-border hover:border-accent/50 transition-colors"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="text-lg font-semibold text-foreground mb-2">
                                  {plan.title}
                                </h4>
                                <p className="text-sm text-muted-foreground mb-4">
                                  {plan.description}
                                </p>
                                <div className="flex items-center gap-4 mb-4">
                                  <span className="text-sm text-muted-foreground">
                                    Duration: <span className="font-medium text-foreground">{plan.duration_type}</span>
                                  </span>
                                  <span className="text-sm text-muted-foreground">
                                    Type: <span className="font-medium text-foreground">{plan.type}</span>
                                  </span>
                                  <span className="text-sm text-muted-foreground">
                                    Price: <span className="font-medium text-foreground">{plan.price}</span>
                                  </span>
                                </div>
                                {plan.feature && plan.feature.length > 0 && (
                                  <div className="mt-4">
                                    <p className="text-sm font-medium text-foreground mb-2">Features:</p>
                                    <ul className="list-disc list-inside space-y-1">
                                      {plan.feature.map((feature: string, index: number) => (
                                        <li key={index} className="text-sm text-muted-foreground">
                                          {feature}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                              <div className="flex gap-2 ml-4">
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setSelectedPlan(plan);
                                    setEditPlanOpen(true);
                                  }}
                                  className="bg-accent hover:bg-accent/90 text-black font-medium rounded-lg h-9 px-6"
                                >
                                  Edit
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => {
                                    setSelectedPlan(plan);
                                    setDeletePlanOpen(true);
                                  }}
                                  className="bg-destructive hover:bg-destructive/90 text-white font-medium rounded-lg h-9 px-6"
                                >
                                  Delete
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      No packages added yet. Click "Add New Package" to get started.
                    </div>
                  )}
                </div>
              </div>
            )}
        </div>
      </main>

      <AddCategoryDialog open={addCategoryOpen} onOpenChange={setAddCategoryOpen} />
      <EditCategoryDialog
        open={editCategoryOpen}
        onOpenChange={setEditCategoryOpen}
        category={selectedCategory}
      />
      <DeleteCategoryDialog
        open={deleteCategoryOpen}
        onOpenChange={setDeleteCategoryOpen}
        categoryId={selectedCategory?.id || null}
        categoryName={selectedCategory?.name || ""}
      />
      <AddBrandQuestionDialog open={addQuestionOpen} onOpenChange={setAddQuestionOpen} />
      <EditBrandQuestionDialog
        open={editQuestionOpen}
        onOpenChange={setEditQuestionOpen}
        question={selectedQuestion}
      />
      <DeleteBrandQuestionDialog
        open={deleteQuestionOpen}
        onOpenChange={setDeleteQuestionOpen}
        questionId={selectedQuestion?.id || null}
        questionText={selectedQuestion?.question || ""}
      />
      <AddToolDialog open={addToolOpen} onOpenChange={setAddToolOpen} />
      <EditToolDialog
        open={editToolOpen}
        onOpenChange={setEditToolOpen}
        tool={selectedTool}
      />
      <DeleteToolDialog
        open={deleteToolOpen}
        onOpenChange={setDeleteToolOpen}
        toolId={selectedTool?.id || null}
        toolName={selectedTool?.name || ""}
      />
      <AddStatisticQuestionDialog open={addStatisticQuestionOpen} onOpenChange={setAddStatisticQuestionOpen} />
      <EditStatisticQuestionDialog
        open={editStatisticQuestionOpen}
        onOpenChange={setEditStatisticQuestionOpen}
        question={selectedStatisticQuestion}
      />
      <DeleteStatisticQuestionDialog
        open={deleteStatisticQuestionOpen}
        onOpenChange={setDeleteStatisticQuestionOpen}
        questionId={selectedStatisticQuestion?.id || null}
        questionText={selectedStatisticQuestion?.question || ""}
      />
      <AddProductQuestionDialog open={addProductQuestionOpen} onOpenChange={setAddProductQuestionOpen} />
      <EditProductQuestionDialog
        open={editProductQuestionOpen}
        onOpenChange={setEditProductQuestionOpen}
        question={selectedProductQuestion}
      />
      <DeleteProductQuestionDialog
        open={deleteProductQuestionOpen}
        onOpenChange={setDeleteProductQuestionOpen}
        questionId={selectedProductQuestion?.id || null}
        questionText={selectedProductQuestion?.question || ""}
      />
      <AddManagementQuestionDialog open={addManagementQuestionOpen} onOpenChange={setAddManagementQuestionOpen} />
      <EditManagementQuestionDialog
        open={editManagementQuestionOpen}
        onOpenChange={setEditManagementQuestionOpen}
        question={selectedManagementQuestion}
      />
      <DeleteManagementQuestionDialog
        open={deleteManagementQuestionOpen}
        onOpenChange={setDeleteManagementQuestionOpen}
        questionId={selectedManagementQuestion?.id || null}
        questionText={selectedManagementQuestion?.question || ""}
      />
      <AddAccountDialog open={addAccountOpen} onOpenChange={setAddAccountOpen} />
      <EditAccountDialog
        open={editAccountOpen}
        onOpenChange={setEditAccountOpen}
        account={selectedAccount}
      />
      <DeleteAccountDialog
        open={deleteAccountOpen}
        onOpenChange={setDeleteAccountOpen}
        accountId={selectedAccount?.id || null}
        accountPlatform={selectedAccount?.platform || ""}
      />
      <AddAccountQuestionDialog open={addAccountQuestionOpen} onOpenChange={setAddAccountQuestionOpen} />
      <EditAccountQuestionDialog
        open={editAccountQuestionOpen}
        onOpenChange={setEditAccountQuestionOpen}
        question={selectedAccountQuestion}
      />
      <DeleteAccountQuestionDialog
        open={deleteAccountQuestionOpen}
        onOpenChange={setDeleteAccountQuestionOpen}
        questionId={selectedAccountQuestion?.id || null}
        questionText={selectedAccountQuestion?.question || ""}
      />
      <AddAdInformationQuestionDialog open={addAdInformationQuestionOpen} onOpenChange={setAddAdInformationQuestionOpen} />
      <EditAdInformationQuestionDialog
        open={editAdInformationQuestionOpen}
        onOpenChange={setEditAdInformationQuestionOpen}
        question={selectedAdInformationQuestion}
      />
      <DeleteAdInformationQuestionDialog
        open={deleteAdInformationQuestionOpen}
        onOpenChange={setDeleteAdInformationQuestionOpen}
        questionId={selectedAdInformationQuestion?.id || null}
        questionText={selectedAdInformationQuestion?.question || ""}
      />
      <AddHandoverQuestionDialog open={addHandoverQuestionOpen} onOpenChange={setAddHandoverQuestionOpen} />
      <EditHandoverQuestionDialog
        open={editHandoverQuestionOpen}
        onOpenChange={setEditHandoverQuestionOpen}
        question={selectedHandoverQuestion}
      />
      <DeleteHandoverQuestionDialog
        open={deleteHandoverQuestionOpen}
        onOpenChange={setDeleteHandoverQuestionOpen}
        questionId={selectedHandoverQuestion?.id || null}
        questionText={selectedHandoverQuestion?.question || ""}
      />
      <AddPlanDialog open={addPlanOpen} onOpenChange={setAddPlanOpen} />
      <EditPlanDialog
        open={editPlanOpen}
        onOpenChange={setEditPlanOpen}
        plan={selectedPlan}
      />
      <DeletePlanDialog
        open={deletePlanOpen}
        onOpenChange={setDeletePlanOpen}
        planId={selectedPlan?.id || null}
        planTitle={selectedPlan?.title || ""}
      />
    </div>
  );
};

export default AdminContentManagement;
