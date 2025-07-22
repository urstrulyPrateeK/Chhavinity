import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logout } from "../lib/api";

const useLogout = () => {
  const queryClient = useQueryClient();

  const {
    mutate: logoutMutation,
    isPending,
    error,
  } = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      // Clear token from localStorage
      localStorage.removeItem('authToken');
      console.log("🔑 Token cleared from localStorage");
      
      // Clear auth state
      queryClient.setQueryData(["authUser"], null);
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      queryClient.invalidateQueries({ queryKey: ["streamToken"] });
    },
  });

  return { logoutMutation, isPending, error };
};
export default useLogout;
