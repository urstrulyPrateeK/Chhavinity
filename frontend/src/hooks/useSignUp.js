import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signup } from "../lib/api";

const useSignUp = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending, error } = useMutation({
    mutationFn: signup,
    onSuccess: async (data) => {
      console.log("🟢 Signup successful, setting auth data:", data);
      
      // Manually set the auth user data instead of just invalidating
      queryClient.setQueryData(["authUser"], { user: data.user });
      
      // Add a small delay to ensure cookie is properly set
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
