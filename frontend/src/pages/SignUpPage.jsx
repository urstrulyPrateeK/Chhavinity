import { useState } from "react";
import { Eye, EyeOff, Check, X } from "lucide-react";
import { Link } from "react-router";

import useSignUp from "../hooks/useSignUp";
import ChhavimityLogo from "../components/ChhavimityLogo";

const SignUpPage = () => {
  const [signupData, setSignupData] = useState({
    fullName: "",
    email: "",
    username: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [usernameCheck, setUsernameCheck] = useState({
    checking: false,
    available: null,
    message: "",
  });
  const [usernameSuggestions, setUsernameSuggestions] = useState([]);

  // This is how we did it at first, without using our custom hook
  // const queryClient = useQueryClient();
  // const {
  //   mutate: signupMutation,
  //   isPending,
  //   error,
  // } = useMutation({
  //   mutationFn: signup,
  //   onSuccess: () => queryClient.invalidateQueries({ queryKey: ["authUser"] }),
  // });

  // This is how we did it using our custom hook - optimized version
  const { isPending, error, signupMutation } = useSignUp();

  // Username availability check - simplified
  const checkUsernameAvailability = async (username) => {
    if (!username || username.length < 1) {
      setUsernameCheck({ checking: false, available: null, message: "" });
      setUsernameSuggestions([]);
      return;
    }

    setUsernameCheck({ checking: true, available: null, message: "" });

    try {
      const response = await fetch(`http://localhost:5001/api/auth/check-username/${username}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      setUsernameCheck({
        checking: false,
        available: data.available,
        message: data.message,
      });

      // Generate suggestions if username is not available
      if (!data.available && data.message === "Username already taken") {
        generateUsernameSuggestions(username);
      } else {
        setUsernameSuggestions([]);
      }
    } catch (error) {
      console.error("Username check error:", error);
      setUsernameCheck({
        checking: false,
        available: null,
        message: "Couldn't check username availability",
      });
      setUsernameSuggestions([]);
    }
  };

  const generateUsernameSuggestions = (baseUsername) => {
    const suggestions = [];
    const numbers = ['01', '02', '07', '99', '123'];
    const suffixes = ['_dev', '_code', '_tech', '.dev', '.js'];
    
    // Add numbers
    numbers.forEach(num => {
      suggestions.push(`${baseUsername}${num}`);
      suggestions.push(`${baseUsername}_${num}`);
    });
    
    // Add suffixes
    suffixes.forEach(suffix => {
      suggestions.push(`${baseUsername}${suffix}`);
    });
    
    // Mix some combinations
    suggestions.push(`dev_${baseUsername}`);
    suggestions.push(`${baseUsername}.official`);
    
    setUsernameSuggestions(suggestions.slice(0, 6)); // Show only 6 suggestions
  };

  const selectSuggestion = (suggestion) => {
    setSignupData({ ...signupData, username: suggestion });
    setUsernameSuggestions([]);
    checkUsernameAvailability(suggestion);
  };

  const handleUsernameChange = (e) => {
    const username = e.target.value;
    setSignupData({ ...signupData, username });
    
    // Debounce username check
    clearTimeout(window.usernameCheckTimeout);
    window.usernameCheckTimeout = setTimeout(() => {
      checkUsernameAvailability(username);
    }, 300); // Reduced debounce time for better UX
  };

  const handleSignup = (e) => {
    e.preventDefault();
    // Simple validation - just submit and let backend handle username uniqueness
    signupMutation(signupData);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      data-theme="synthwave"
    >
      <div className="flex flex-col lg:flex-row w-full max-w-5xl mx-auto bg-base-100/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-primary/20 overflow-hidden">
        {/* SIGNUP FORM - LEFT SIDE */}
        <div className="w-full lg:w-3/5 p-6 lg:p-8">
          {/* LOGO */}
          <div className="mb-6 flex items-center justify-center lg:justify-start">
            <ChhavimityLogo size="lg" showText={true} animate={true} />
          </div>

          {/* ERROR MESSAGE IF ANY */}
          {error && (
            <div className="alert alert-error mb-4 py-2">
              <span className="text-sm">{error?.response?.data?.message || error?.message || "An error occurred"}</span>
            </div>
          )}

          <div className="w-full">
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="text-center lg:text-left mb-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Create Account
                </h2>
                <p className="text-sm opacity-70 mt-1">
                  Join the developer community and start connecting!
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* FULLNAME */}
                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text text-sm font-medium">Full Name</span>
                  </label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    className="input input-bordered input-sm w-full focus:input-primary"
                    value={signupData.fullName}
                    onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
                    required
                  />
                </div>
                
                {/* EMAIL */}
                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text text-sm font-medium">Email</span>
                  </label>
                  <input
                    type="email"
                    placeholder="hello@example.com"
                    className="input input-bordered input-sm w-full focus:input-primary"
                    value={signupData.email}
                    onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* USERNAME - Full width */}
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-sm font-medium">Username</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="dev_07"
                    className={`input input-bordered input-sm w-full pr-10 focus:input-primary ${
                      usernameCheck.available === true ? 'input-success' : 
                      usernameCheck.available === false ? 'input-error' : ''
                    }`}
                    value={signupData.username}
                    onChange={handleUsernameChange}
                    required
                    maxLength={30}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    {usernameCheck.checking && (
                      <span className="loading loading-spinner loading-xs"></span>
                    )}
                    {!usernameCheck.checking && usernameCheck.available === true && (
                      <Check className="size-4 text-success" />
                    )}
                    {!usernameCheck.checking && usernameCheck.available === false && (
                      <X className="size-4 text-error" />
                    )}
                  </div>
                </div>
                
                {/* Username feedback */}
                {usernameCheck.message && (
                  <div className={`text-xs mt-1 ${usernameCheck.available ? 'text-success' : 'text-error'}`}>
                    {usernameCheck.message}
                  </div>
                )}

                {/* Username suggestions - Compact */}
                {usernameSuggestions.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs opacity-70 mb-1">Try these:</p>
                    <div className="flex flex-wrap gap-1">
                      {usernameSuggestions.slice(0, 4).map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          className="badge badge-outline badge-xs cursor-pointer hover:badge-primary transition-colors"
                          onClick={() => selectSuggestion(suggestion)}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* PASSWORD */}
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-sm font-medium">Password</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="********"
                    className="input input-bordered input-sm w-full pr-10 focus:input-primary"
                    value={signupData.password}
                    onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3 hover:text-primary transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="size-4 opacity-70" />
                    ) : (
                      <Eye className="size-4 opacity-70" />
                    )}
                  </button>
                </div>
              </div>

              <div className="form-control">
                <label className="label cursor-pointer justify-start gap-2 py-2">
                  <input type="checkbox" className="checkbox checkbox-xs checkbox-primary" required />
                  <span className="text-xs">
                    I agree to the{" "}
                    <span className="text-primary hover:underline cursor-pointer">Terms</span> and{" "}
                    <span className="text-primary hover:underline cursor-pointer">Privacy Policy</span>
                  </span>
                </label>
              </div>

              <button 
                className="btn btn-primary btn-sm w-full shadow-lg hover:shadow-primary/25 transition-all duration-300" 
                type="submit" 
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <span className="loading loading-spinner loading-xs"></span>
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>

              <div className="text-center mt-4">
                <p className="text-sm">
                  Already have an account?{" "}
                  <Link to="/login" className="text-primary hover:underline font-medium">
                    Sign in
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>

        {/* ILLUSTRATION - RIGHT SIDE */}
        <div className="hidden lg:flex w-2/5 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"></div>
          <div className="relative z-10 text-center p-8">
            <div className="mb-6">
              <div className="w-32 h-32 mx-auto bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-primary/30">
                <ChhavimityLogo size="2xl" animate={true} />
              </div>
            </div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-3">
              Welcome to the Future
            </h3>
            <p className="text-sm opacity-80 leading-relaxed">
              Connect with developers worldwide in a cyberpunk-inspired platform designed for the next generation of coders.
            </p>
            <div className="mt-6 flex justify-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-secondary rounded-full animate-pulse delay-75"></div>
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse delay-150"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;