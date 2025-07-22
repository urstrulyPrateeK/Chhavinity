import { useMutation, useQueryClient } from "@tanstack/react-query";
import { login } from "../lib/api";

const useLogin = () => {
  const queryClient = useQueryClient();
  const { mutate, isPending, error } = useMutation({
    mutationFn: login,
    onSuccess: async (data) => {
      console.log("🟢 Login successful, setting auth data:", data);
      
      // Store token in localStorage for cross-domain compatibility
      if (data.token) {
        localStorage.setItem('authToken', data.token);
        console.log("🔑 Token stored in localStorage");
      }
      
      // Manually set the auth user data instead of just invalidating
      queryClient.setQueryData(["authUser"], { user: data.user });
      
      // Add a small delay to ensure token is properly stored
      setTimeout(() => {
        console.log("🔄 Invalidating queries after login...");
        queryClient.invalidateQueries({ queryKey: ["authUser"] });
        queryClient.invalidateQueries({ queryKey: ["streamToken"] });
      }, 100);
    },
  });

  return { error, isPending, loginMutation: mutate };
};

export default useLogin;
