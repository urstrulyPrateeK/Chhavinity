import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signup } from "../lib/api";

const useSignUp = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending, error } = useMutation({
    mutationFn: signup,
    onSuccess: async (data) => {
      console.log("🟢 Signup successful, setting auth data:", data);
      
      // Store token in localStorage for cross-domain compatibility
      if (data.token) {
        localStorage.setItem('authToken', data.token);
        console.log("🔑 Token stored in localStorage");
      }
      
      // Manually set the auth user data instead of just invalidating
      queryClient.setQueryData(["authUser"], { user: data.user });
      
      // Add a small delay to ensure token is properly stored
      setTimeout(() => {
        console.log("🔄 Invalidating queries after signup...");
        queryClient.invalidateQueries({ queryKey: ["authUser"] });
        queryClient.invalidateQueries({ queryKey: ["streamToken"] });
      }, 100);
    },
  });

  return { isPending, error, signupMutation: mutate };
};
export default useSignUp;
