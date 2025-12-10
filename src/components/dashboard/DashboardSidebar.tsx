import { LayoutGrid, Building2, Wrench, CreditCard, Info, Users, Megaphone, HandHeart, Package, TrendingUp, ShoppingBag, Target, ChevronDown, ChevronRight } from "lucide-react";
import type { DashboardStep } from "@/pages/Dashboard";
import { useState } from "react";
import { Link } from "react-router-dom";
import logo from "@/assets/_App Icon 1 (2).png";

interface DashboardSidebarProps {
  activeStep: DashboardStep;
  onStepChange: (step: DashboardStep) => void;
}

const menuItems = [
  { id: "category" as DashboardStep, label: "Category", icon: LayoutGrid },
  { id: "brand-information" as DashboardStep, label: "Brand Information", icon: Building2 },
  { id: "tools" as DashboardStep, label: "Tools you use", icon: Wrench },
  { id: "financials" as DashboardStep, label: "Financials", icon: CreditCard },
  { id: "additional-information" as DashboardStep, label: "Additional Information", icon: Info, hasSubItems: true },
  { id: "accounts" as DashboardStep, label: "Accounts", icon: Users },
  { id: "ad-informations" as DashboardStep, label: "Ad Informations", icon: Megaphone },
  { id: "handover" as DashboardStep, label: "Handover", icon: HandHeart },
  { id: "packages" as DashboardStep, label: "Packages", icon: Package },
];

const additionalInfoSubItems = [
  { id: "statistics" as DashboardStep, label: "Statistics", icon: TrendingUp },
  { id: "products" as DashboardStep, label: "Products", icon: ShoppingBag },
  { id: "management" as DashboardStep, label: "Management", icon: Target },
];

export const DashboardSidebar = ({ activeStep, onStepChange }: DashboardSidebarProps) => {
  const [isAdditionalInfoExpanded, setIsAdditionalInfoExpanded] = useState(
    activeStep === "additional-information" || activeStep === "statistics" || activeStep === "products" || activeStep === "management"
  );

  const isAdditionalInfoActive = activeStep === "additional-information" || activeStep === "statistics" || activeStep === "products" || activeStep === "management";

  return (
    <aside className="w-60 bg-[hsl(0_0%_0%)] text-white flex flex-col">
      <div className="p-6">
        <Link to="/" className="flex items-center justify-center">
          <img 
            src={logo} 
            alt="EX Logo" 
            className="h-12 w-12 object-contain"
          />
        </Link>
      </div>
      
      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === "additional-information" ? isAdditionalInfoActive : activeStep === item.id;
          const hasSubItems = item.hasSubItems;
          
          if (item.id === "additional-information") {
            return (
              <div key={item.id}>
                <button
                  onClick={() => {
                    setIsAdditionalInfoExpanded(!isAdditionalInfoExpanded);
                    if (!isAdditionalInfoExpanded) {
                      onStepChange("additional-information");
                    }
                  }}
                  className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? "bg-accent text-[hsl(0_0%_0%)]" 
                      : "text-white/70 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  {hasSubItems && (
                    isAdditionalInfoExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
                  )}
                </button>
                
                {isAdditionalInfoExpanded && (
                  <div className="ml-4 mt-1 space-y-1">
                    {additionalInfoSubItems.map((subItem) => {
                      const SubIcon = subItem.icon;
                      const isSubActive = activeStep === subItem.id;
                      
                      return (
                        <button
                          key={subItem.id}
                          onClick={() => onStepChange(subItem.id)}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm ${
                            isSubActive
                              ? "bg-white/10 text-white" 
                              : "text-white/60 hover:text-white hover:bg-white/5"
                          }`}
                        >
                          <SubIcon className="w-4 h-4" />
                          <span>{subItem.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }
          
          return (
            <button
              key={item.id}
              onClick={() => onStepChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive 
                  ? "bg-accent text-[hsl(0_0%_0%)]" 
                  : "text-white/70 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
