import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, Package, Target } from "lucide-react";
import { useStatisticQuestions } from "@/hooks/useStatisticQuestions";
import { useProductQuestions } from "@/hooks/useProductQuestions";
import { useManagementQuestions } from "@/hooks/useManagementQuestions";
import { toast } from "sonner";

interface AdditionalInformationStepProps {
  formData?: any;
  onNext: (data: any) => void;
  onBack: () => void;
  defaultTab?: "statistics" | "products" | "management";
}

export const AdditionalInformationStep = ({ formData: parentFormData, onNext, onBack, defaultTab = "statistics" }: AdditionalInformationStepProps) => {
  const [activeTab, setActiveTab] = useState<"statistics" | "products" | "management">(defaultTab);
  
  // Update active tab when defaultTab changes
  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  // Fetch questions for each tab
  const { data: statisticQuestions = [], isLoading: statisticsLoading } = useStatisticQuestions();
  const { data: productQuestions = [], isLoading: productsLoading } = useProductQuestions();
  const { data: managementQuestions = [], isLoading: managementLoading } = useManagementQuestions();

  const [formData, setFormData] = useState<Record<string, any>>(parentFormData || {});

  useEffect(() => {
    if (parentFormData) {
      setFormData(parentFormData);
    }
  }, [parentFormData]);

  const validateForm = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    let questionsToValidate: any[] = [];
    
    // Get questions for the active tab
    if (activeTab === "statistics") {
      questionsToValidate = statisticQuestions;
    } else if (activeTab === "products") {
      questionsToValidate = productQuestions;
    } else if (activeTab === "management") {
      questionsToValidate = managementQuestions;
    }
    
    // Check if all questions have answers
    questionsToValidate.forEach((question: any) => {
      const value = formData[question.id];
      
      // Required fields validation
      if (!value || (typeof value === 'string' && value.trim() === '') || 
          (Array.isArray(value) && value.length === 0)) {
        errors.push(`${question.question} is required`);
      }
      
      // Additional validations based on answer type
      if (question.answer_type === 'NUMBER' && value && isNaN(Number(value))) {
        errors.push(`${question.question} must be a valid number`);
      }
      
      if (question.answer_type === 'DATE' && value && !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        errors.push(`${question.question} must be a valid date`);
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const handleContinue = () => {
    const validation = validateForm();
    
    if (!validation.isValid) {
      // Show first error
      if (validation.errors.length > 0) {
        toast.error(validation.errors[0]);
      } else {
        toast.error("Please fill in all required fields");
      }
      return;
    }
    
    onNext(formData);
  };

  const renderField = (question: any) => {
    const value = formData[question.id] || "";
    
    switch (question.answer_type) {
      case "TEXT":
        return (
          <Input
            value={value}
            onChange={(e) => setFormData({ ...formData, [question.id]: e.target.value })}
            placeholder="Enter your answer"
            className="bg-muted/50"
          />
        );
      
      case "NUMBER":
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => setFormData({ ...formData, [question.id]: e.target.value })}
            placeholder="Enter a number"
            className="bg-muted/50"
          />
        );
      
      case "TEXTAREA":
        return (
          <Textarea
            value={value}
            onChange={(e) => setFormData({ ...formData, [question.id]: e.target.value })}
            placeholder="Enter your answer"
            className="bg-muted/50 min-h-[100px]"
          />
        );
      
      case "DATE":
        return (
          <Input
            type="date"
            value={value}
            onChange={(e) => setFormData({ ...formData, [question.id]: e.target.value })}
            className="bg-muted/50"
          />
        );
      
      case "YESNO":
      case "BOOLEAN":
        return (
          <div className="flex gap-4">
            <Button
              type="button"
              variant={value === "yes" || value === "true" ? "default" : "outline"}
              onClick={() => setFormData({ ...formData, [question.id]: "yes" })}
              className={value === "yes" || value === "true" ? "bg-accent text-accent-foreground px-12" : "px-12"}
            >
              Yes
            </Button>
            <Button
              type="button"
              variant={value === "no" || value === "false" ? "default" : "outline"}
              onClick={() => setFormData({ ...formData, [question.id]: "no" })}
              className={value === "no" || value === "false" ? "bg-accent text-accent-foreground px-12" : "px-12"}
            >
              No
            </Button>
          </div>
        );
      
      case "SELECT":
        return (
          <Select value={value} onValueChange={(val) => setFormData({ ...formData, [question.id]: val })}>
            <SelectTrigger className="bg-muted/50">
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {question.option && Array.isArray(question.option) && question.option.map((opt: string, idx: number) => (
                <SelectItem key={idx} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      default:
        return (
          <Input
            value={value}
            onChange={(e) => setFormData({ ...formData, [question.id]: e.target.value })}
            placeholder="Enter your answer"
            className="bg-muted/50"
          />
        );
    }
  };

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Additional Information</h1>

      <div className="flex gap-2 mb-6 bg-accent/10 p-1 rounded-lg w-fit">
        <Button
          type="button"
          variant={activeTab === "statistics" ? "default" : "ghost"}
          onClick={() => setActiveTab("statistics")}
          className={activeTab === "statistics" ? "bg-accent text-accent-foreground" : ""}
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          Statistics
        </Button>
        <Button
          type="button"
          variant={activeTab === "products" ? "default" : "ghost"}
          onClick={() => setActiveTab("products")}
          className={activeTab === "products" ? "bg-accent text-accent-foreground" : ""}
        >
          <Package className="w-4 h-4 mr-2" />
          Products
        </Button>
        <Button
          type="button"
          variant={activeTab === "management" ? "default" : "ghost"}
          onClick={() => setActiveTab("management")}
          className={activeTab === "management" ? "bg-accent text-accent-foreground" : ""}
        >
          <Target className="w-4 h-4 mr-2" />
          Management
        </Button>
      </div>

      {activeTab === "statistics" && (
        <div className="space-y-6 bg-card rounded-xl p-8 border border-border">
          {statisticsLoading ? (
            <div className="text-muted-foreground text-center py-8">Loading questions...</div>
          ) : statisticQuestions.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No statistic questions available. Please contact the administrator.
            </div>
          ) : (
            statisticQuestions.map((question: any) => (
              <div key={question.id} className="space-y-3">
                <Label className="text-base font-semibold">{question.question}</Label>
                {renderField(question)}
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "products" && (
        <div className="space-y-6 bg-card rounded-xl p-8 border border-border">
          {productsLoading ? (
            <div className="text-muted-foreground text-center py-8">Loading questions...</div>
          ) : productQuestions.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No product questions available. Please contact the administrator.
            </div>
          ) : (
            productQuestions.map((question: any) => (
              <div key={question.id} className="space-y-3">
                <Label className="text-base font-semibold">{question.question}</Label>
                {renderField(question)}
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "management" && (
        <div className="space-y-6 bg-card rounded-xl p-8 border border-border">
          {managementLoading ? (
            <div className="text-muted-foreground text-center py-8">Loading questions...</div>
          ) : managementQuestions.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No management questions available. Please contact the administrator.
            </div>
          ) : (
            managementQuestions.map((question: any) => (
              <div key={question.id} className="space-y-3">
                <Label className="text-base font-semibold">{question.question}</Label>
                {renderField(question)}
              </div>
            ))
          )}
        </div>
      )}

      <div className="flex gap-4 mt-8">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button 
          onClick={handleContinue}
          className="bg-accent hover:bg-accent/90 text-accent-foreground w-full"
        >
          Save
        </Button>
      </div>
    </div>
  );
};
