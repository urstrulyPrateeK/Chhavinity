import { useMutation, useQueryClient } from "@tanstack/react-query";
import { login } from "../lib/api";

const useLogin = () => {
  const queryClient = useQueryClient();
  const { mutate, isPending, error } = useMutation({
    mutationFn: login,
    onSuccess: async (data) => {
      console.log("🟢 Login successful, setting auth data:", data);
      
      // Manually set the auth user data instead of just invalidating
      queryClient.setQueryData(["authUser"], { user: data.user });
      
      // Add a small delay to ensure cookie is properly set
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
