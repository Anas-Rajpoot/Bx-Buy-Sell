import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Upload, X, Paperclip, ImageIcon } from "lucide-react";
import { useAdInformationQuestions } from "@/hooks/useAdInformationQuestions";
import { toast } from "sonner";

interface AdInformationsStepProps {
  formData?: any;
  onNext: (data: any) => void;
  onBack: () => void;
}

export const AdInformationsStep = ({ formData: parentFormData, onNext, onBack }: AdInformationsStepProps) => {
  const { data: questions, isLoading } = useAdInformationQuestions();
  const [formData, setFormData] = useState<Record<string, any>>(parentFormData || {});
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [attachmentPreviews, setAttachmentPreviews] = useState<Array<{ name: string; preview: string }>>([]);

  useEffect(() => {
    if (parentFormData) {
      setFormData(parentFormData);
      // Restore photo preview if exists
      const photoData = Object.values(parentFormData).find((val: any) => typeof val === 'string' && val.startsWith('data:image'));
      if (photoData) {
        setPhotoPreview(photoData as string);
      }
    }
  }, [parentFormData]);

  const handlePhotoUpload = (questionId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Photo must be less than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setPhotoPreview(base64);
        setFormData(prev => ({ ...prev, [questionId]: base64 }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileUpload = (questionId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Maximum size is 10MB`);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setAttachmentPreviews(prev => [...prev, { name: file.name, preview: base64 }]);
        const currentFiles = formData[questionId] || [];
        setFormData(prev => ({ ...prev, [questionId]: [...currentFiles, base64] }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (questionId: string) => {
    setPhotoPreview("");
    setFormData(prev => ({ ...prev, [questionId]: "" }));
  };

  const removeAttachment = (questionId: string, index: number) => {
    setAttachmentPreviews(prev => prev.filter((_, i) => i !== index));
    const currentFiles = formData[questionId] || [];
    setFormData(prev => ({ ...prev, [questionId]: currentFiles.filter((_: any, i: number) => i !== index) }));
  };

  const handleInputChange = (questionId: string, value: string) => {
    setFormData(prev => ({ ...prev, [questionId]: value }));
  };

  const validateForm = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    // Check if all questions have answers
    questions.forEach((question: any) => {
      const value = formData[question.id];
      
      // Required fields validation
      if (!value || 
          (typeof value === 'string' && value.trim() === '') || 
          (Array.isArray(value) && value.length === 0)) {
        errors.push(`${question.question} is required`);
      }
      
      // Additional validations based on answer type
      if (question.answer_type === 'NUMBER' && value && isNaN(Number(value))) {
        errors.push(`${question.question} must be a valid number`);
      }
      
      if (question.answer_type === 'PHOTO' || question.answer_type === 'PHOTO_UPLOAD') {
        if (!value || value.trim() === '') {
          errors.push(`${question.question} requires a photo upload`);
        }
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const handleSubmit = () => {
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

  if (isLoading) {
    return (
      <div className="max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Ad Information</h1>
        <div className="text-muted-foreground">Loading questions...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Ad Information</h1>

      <div className="space-y-6">
        {questions && questions.length > 0 ? (
          questions.map((question: any) => (
            <div key={question.id} className="space-y-2">
              <label className="text-sm font-medium">
                {question.question}
              </label>
              
              {(question.answer_type === "PHOTO" || question.answer_type === "PHOTO_UPLOAD") && (
                <div>
                  {!formData[question.id] ? (
                    <div className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center hover:border-accent/50 transition-colors cursor-pointer bg-muted/30">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handlePhotoUpload(question.id, e)}
                        className="hidden"
                        id={`photo-${question.id}`}
                      />
                      <label htmlFor={`photo-${question.id}`} className="cursor-pointer text-center w-full">
                        <ImageIcon className="w-12 h-12 text-muted-foreground mb-3 mx-auto" />
                        <p className="text-sm text-muted-foreground">Click to upload photo</p>
                        <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</p>
                      </label>
                    </div>
                  ) : (
                    <div className="relative">
                      <img
                        src={formData[question.id]}
                        alt="Preview"
                        className="w-full h-64 object-cover rounded-xl"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8"
                        onClick={() => removePhoto(question.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              )}
              
              {(question.answer_type === "FILE" || question.answer_type === "FILE_UPLOAD") && (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-border rounded-xl p-12 flex flex-col items-center justify-center hover:border-accent/50 transition-colors cursor-pointer bg-muted/30">
                    <input
                      type="file"
                      multiple
                      onChange={(e) => handleFileUpload(question.id, e)}
                      className="hidden"
                      id={`file-${question.id}`}
                    />
                    <label htmlFor={`file-${question.id}`} className="cursor-pointer text-center w-full">
                      <Upload className="w-12 h-12 text-muted-foreground mb-3 mx-auto" />
                      <p className="text-sm text-muted-foreground mb-1">Upload attachments</p>
                      <Button type="button" variant="outline" size="sm">Select Files</Button>
                    </label>
                  </div>
                  {attachmentPreviews.length > 0 && (
                    <div className="space-y-2">
                      {attachmentPreviews.map((attachment, index) => (
                        <div key={index} className="flex items-center justify-between border rounded-lg p-3 bg-muted/30">
                          <div className="flex items-center gap-2">
                            <Paperclip className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">{attachment.name}</span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => removeAttachment(question.id, index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              {question.answer_type === "NUMBER" && (
                <Input
                  type="number"
                  placeholder="Enter number"
                  value={formData[question.id] || ""}
                  onChange={(e) => handleInputChange(question.id, e.target.value)}
                  className="bg-muted/50"
                />
              )}
              
              {question.answer_type === "TEXT" && (
                <Textarea
                  placeholder="Enter your answer"
                  value={formData[question.id] || ""}
                  onChange={(e) => handleInputChange(question.id, e.target.value)}
                  className="bg-muted/50 min-h-24"
                />
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            No ad information questions configured yet. Please contact admin to add questions.
          </div>
        )}

        <div className="flex gap-4 mt-8">
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button 
            onClick={handleSubmit}
            className="bg-accent hover:bg-accent/90 text-accent-foreground ml-auto px-16"
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
};
