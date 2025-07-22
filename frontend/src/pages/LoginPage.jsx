import { useState } from "react";
import { Sparkles, Eye, EyeOff } from "lucide-react";
import { Link } from "react-router";
import useLogin from "../hooks/useLogin";

const LoginPage = () => {
  const [loginData, setLoginData] = useState({
    emailOrUsername: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  // This is how we did it at first, without using our custom hook
  // const queryClient = useQueryClient();
  // const {
  //   mutate: loginMutation,
  //   isPending,
  //   error,
  // } = useMutation({
  //   mutationFn: login,
  //   onSuccess: () => queryClient.invalidateQueries({ queryKey: ["authUser"] }),
  // });

  // This is how we did it using our custom hook - optimized version
  const { isPending, error, loginMutation } = useLogin();

  const handleLogin = (e) => {
    e.preventDefault();
    loginMutation(loginData);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      data-theme="synthwave"
    >
      <div className="flex flex-col lg:flex-row w-full max-w-4xl mx-auto bg-base-100/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-primary/20 overflow-hidden">
        {/* LOGIN FORM SECTION */}
        <div className="w-full lg:w-3/5 p-8 lg:p-12">
          {/* LOGO */}
          <div className="mb-8 flex items-center justify-center lg:justify-start gap-3">
            <Sparkles className="size-10 text-primary animate-pulse" />
            <span className="text-4xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent tracking-wider">
              Chhavinity
            </span>
          </div>

          {/* ERROR MESSAGE DISPLAY */}
          {error && (
            <div className="alert alert-error mb-6 py-3">
              <span className="text-sm">{error?.response?.data?.message || error?.message || "An error occurred"}</span>
            </div>
          )}

          <div className="w-full">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="text-center lg:text-left mb-8">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                  Welcome Back
                </h2>
                <p className="text-base opacity-70">
                  Ready to dive back into the matrix?
                </p>
              </div>

              <div className="space-y-5">
                <div className="form-control">
                  <label className="label py-2">
                    <span className="label-text text-base font-medium">Email or Username</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your email or username"
                    className="input input-bordered w-full focus:input-primary bg-base-200/50 backdrop-blur-sm"
                    value={loginData.emailOrUsername}
                    onChange={(e) => setLoginData({ ...loginData, emailOrUsername: e.target.value })}
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label py-2">
                    <span className="label-text text-base font-medium">Password</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      className="input input-bordered w-full pr-12 focus:input-primary bg-base-200/50 backdrop-blur-sm"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      required
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center pr-4 hover:text-primary transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="size-5 opacity-70" />
                      ) : (
                        <Eye className="size-5 opacity-70" />
                      )}
                    </button>
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary w-full py-3 shadow-lg hover:shadow-primary/25 transition-all duration-300 text-base" 
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Accessing Matrix...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </button>

                <div className="text-center mt-6">
                  <p className="text-base">
                    New to the matrix?{" "}
                    <Link to="/signup" className="text-primary hover:underline font-medium">
                      Create Account
                    </Link>
                  </p>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* ILLUSTRATION SECTION */}
        <div className="hidden lg:flex w-2/5 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"></div>
          
          {/* Animated background elements */}
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary rounded-full animate-ping"></div>
          <div className="absolute top-3/4 right-1/4 w-3 h-3 bg-secondary rounded-full animate-pulse"></div>
          <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-accent rounded-full animate-bounce"></div>
          
          <div className="relative z-10 text-center p-8 max-w-sm">
            <div className="mb-8">
              <div className="w-40 h-40 mx-auto bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-primary/30 relative">
                <Sparkles className="size-20 text-primary animate-pulse" />
                <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-spin border-t-primary"></div>
              </div>
            </div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
              Enter the Network
            </h3>
            <p className="text-base opacity-80 leading-relaxed">
              Connect with developers across the digital realm. Your gateway to unlimited possibilities.
            </p>
            <div className="mt-8 flex justify-center gap-3">
              <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
              <div className="w-3 h-3 bg-secondary rounded-full animate-pulse delay-75"></div>
              <div className="w-3 h-3 bg-accent rounded-full animate-pulse delay-150"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default LoginPage;