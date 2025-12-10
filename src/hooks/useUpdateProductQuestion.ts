import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";

export const useUpdateProductQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { 
      id: string; 
      question: string; 
      answer_type: string;
    }) => {
      const response = await apiClient.updateAdminQuestion(data.id, {
        question: data.question,
        answer_type: data.answer_type,
        answer_for: "PRODUCT",
      });

      if (!response.success) {
        throw new Error(response.error || "Failed to update question");
      }

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-questions"] });
      toast.success("Product question updated successfully");
    },
    onError: (error) => {
      console.error("Error updating question:", error);
      toast.error("Failed to update product question");
    },
  });
};
