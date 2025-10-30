import { toast } from "sonner";

export const notify = {
  success: (message: string) => toast.success(message),
  error: (message: string) => toast.error(message),
  info: (message: string) => toast.info(message),
  warning: (message: string) => toast.warning(message),
  
  // Enhanced error handling
  apiError: (error: any, fallbackMessage: string = "Something went wrong") => {
    const errorMsg = error?.response?.data?.message || 
                    error?.message || 
                    fallbackMessage;
    toast.error(errorMsg);
  }
};