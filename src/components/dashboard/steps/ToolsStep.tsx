import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataIntegrationsStep } from "./DataIntegrationsStep";
import { useTools } from "@/hooks/useTools";

interface ToolsStepProps {
  formData?: any;
  onNext: (data: { tools: string[]; integrations?: string[] }) => void;
  onBack: () => void;
}

interface Tool {
  id: string;
  name: string;
  logo: string;
  highlighted?: boolean;
}

export const ToolsStep = ({ formData: parentFormData, onNext, onBack }: ToolsStepProps) => {
  const [selectedTools, setSelectedTools] = useState<string[]>(parentFormData?.tools || []);
  const [activeTab, setActiveTab] = useState("tools");
  const { data: tools, isLoading } = useTools();

  useEffect(() => {
    if (parentFormData?.tools) {
      setSelectedTools(parentFormData.tools);
    }
  }, [parentFormData]);

  const toggleTool = (toolId: string) => {
    setSelectedTools(prev => 
      prev.includes(toolId) 
        ? prev.filter(id => id !== toolId)
        : [...prev, toolId]
    );
  };

  const handleContinue = () => {
    // Tools are optional, but we can proceed even with no selection
    // Just log a warning if no tools selected
    if (selectedTools.length === 0) {
      console.log('No tools selected - proceeding anyway (tools are optional)');
    }
    onNext({ tools: selectedTools });
  };

  const handleDataIntegrationsNext = (data: { integrations: string[] }) => {
    onNext({ tools: selectedTools, integrations: data.integrations });
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl">
        <h1 className="text-3xl font-bold mb-2">Select Tools</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-40 rounded-2xl border-2 border-border bg-card animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="tools">Tools</TabsTrigger>
          <TabsTrigger value="data-integrations">Data Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="tools">
          <h1 className="text-3xl font-bold mb-2">Select Tools</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8 mb-8">
            {tools && Array.isArray(tools) && tools.map((tool) => {
              const isSelected = selectedTools.includes(tool.id);
              
              return (
                <button
                  key={tool.id}
                  onClick={() => toggleTool(tool.id)}
                  className={`flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all hover:scale-105 ${
                    isSelected 
                      ? "border-accent bg-accent/5" 
                      : "border-border bg-card hover:border-accent/50"
                  }`}
                >
                  <div className="w-20 h-20 flex items-center justify-center">
                    <img src={tool.image_path} alt={tool.name} className="w-full h-full object-contain" />
                  </div>
                  <span className="text-sm font-medium text-center">{tool.name}</span>
                </button>
              );
            })}
          </div>

          <div className="flex gap-4">
            <Button onClick={onBack} variant="outline">
              Back
            </Button>
            <Button onClick={handleContinue}>
              Continue
            </Button>
            <Button 
              onClick={() => setActiveTab("data-integrations")} 
              variant="outline"
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              Next: Data Integration
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="data-integrations">
          <DataIntegrationsStep 
            formData={parentFormData}
            onNext={handleDataIntegrationsNext} 
            onBack={() => setActiveTab("tools")} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
