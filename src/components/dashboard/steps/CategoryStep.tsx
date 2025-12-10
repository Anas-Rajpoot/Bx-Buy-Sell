import { useState, useEffect } from "react";
import { ShoppingBag, Code, Handshake, LayoutGrid } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCategories } from "@/hooks/useCategories";

interface CategoryStepProps {
  formData?: any;
  onNext: (data: { category: string }) => void;
}

interface Category {
  id: string;
  name: string;
  icon?: string;
  bg_color?: string;
  icon_color?: string;
  image_path?: string;
}

const iconMap: Record<string, any> = {
  "shopping-bag": ShoppingBag,
  "code": Code,
  "handshake": Handshake,
  "layout-grid": LayoutGrid,
};

export const CategoryStep = ({ formData, onNext }: CategoryStepProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(formData?.category || "");
  
  // Use the same hook as admin dashboard for consistent category display
  const { data: categories = [], isLoading: loading } = useCategories({ nocache: true });

  useEffect(() => {
    if (formData?.category) {
      setSelectedCategory(formData.category);
    }
  }, [formData]);

  const handleCategorySelect = (categoryId: string) => {
    if (!categoryId) {
      toast.error("Please select a category");
      return;
    }
    setSelectedCategory(categoryId);
    setTimeout(() => {
      onNext({ category: categoryId });
    }, 300);
  };

  const handleContinue = () => {
    if (!selectedCategory) {
      toast.error("Please select a category to continue");
      return;
    }
    onNext({ category: selectedCategory });
  };

  if (loading) {
    return (
      <div className="max-w-5xl">
        <h1 className="text-3xl font-bold mb-2">Select Category</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-48 rounded-2xl border-2 border-border bg-card animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl">
      <h1 className="text-3xl font-bold mb-2">Select Category</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        {categories.map((category) => {
          const Icon = category.icon ? iconMap[category.icon] || LayoutGrid : LayoutGrid;
          const isSelected = selectedCategory === category.id;
          const bgColor = category.bg_color || "bg-blue-100";
          const iconColor = category.icon_color || "text-blue-600";
          
          return (
            <button
              key={category.id}
              onClick={() => handleCategorySelect(category.id)}
              className={`flex flex-col items-center gap-4 p-8 rounded-2xl border-2 transition-all hover:scale-105 ${
                isSelected 
                  ? "border-accent bg-accent/5" 
                  : "border-border bg-card hover:border-accent/50"
              }`}
            >
              {category.image_path ? (
                <div 
                  className="w-20 h-20 rounded-full flex items-center justify-center transition-transform hover:scale-105"
                  style={{ 
                    backgroundColor: 'rgba(156, 163, 175, 0.15)',
                    borderRadius: '16.78px'
                  }}
                >
                  <img 
                    src={category.image_path} 
                    alt={category.name}
                    className="w-16 h-16 object-contain rounded-full"
                  />
                </div>
              ) : (
                <div className={`w-20 h-20 rounded-full ${bgColor} flex items-center justify-center`}>
                  <Icon className={`w-10 h-10 ${iconColor}`} />
                </div>
              )}
              <span className="text-lg font-semibold text-center">{category.name}</span>
            </button>
          );
        })}
      </div>

      {categories.length > 0 && (
        <div className="flex justify-end mt-8">
          <Button 
            onClick={handleContinue}
            disabled={!selectedCategory}
            className="bg-accent hover:bg-accent/90 text-accent-foreground px-16"
          >
            Continue
          </Button>
        </div>
      )}
    </div>
  );
};
