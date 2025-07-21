import { useState } from "react";
import { Sparkles, Eye, EyeOff, Check, X } from "lucide-react";
import { Link } from "react-router";

import useSignUp from "../hooks/useSignUp";

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
      className="h-screen flex items-center justify-center p-4 sm:p-6 md:p-8"
      data-theme="forest"
    >
      <div className="border border-primary/25 flex flex-col lg:flex-row w-full max-w-5xl mx-auto bg-base-100 rounded-xl shadow-lg overflow-hidden">
        {/* SIGNUP FORM - LEFT SIDE */}
        <div className="w-full lg:w-1/2 p-4 sm:p-8 flex flex-col">
          {/* LOGO */}
          <div className="mb-4 flex items-center justify-start gap-2">
            <Sparkles className="size-9 text-primary" />
            <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
              Chhavinity
            </span>
          </div>

          {/* ERROR MESSAGE IF ANY */}
          {error && (
            <div className="alert alert-error mb-4">
              <span>{error?.response?.data?.message || error?.message || "An error occurred"}</span>
            </div>
          )}

          <div className="w-full">
            <form onSubmit={handleSignup}>
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold">Create an Account</h2>
                  <p className="text-sm opacity-70">
                    Join Chhavinity and connect with fellow developers!
                  </p>
                </div>

                <div className="space-y-3">
                  {/* FULLNAME */}
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text">Full Name</span>
                    </label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      className="input input-bordered w-full"
                      value={signupData.fullName}
                      onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
                      required
                    />
                  </div>
                  
                  {/* USERNAME */}
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text">Username</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="dev_07"
                        className={`input input-bordered w-full pr-10 ${
                          usernameCheck.available === true ? 'input-success' : 
                          usernameCheck.available === false ? 'input-error' : ''
                        }`}
                        value={signupData.username}
                        onChange={handleUsernameChange}
                        required
                        maxLength={30}
                        pattern="[a-zA-Z0-9._]+"
                        title="Username can contain letters, numbers, periods, and underscores"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        {usernameCheck.checking && (
                          <span className="loading loading-spinner loading-sm"></span>
                        )}
                        {!usernameCheck.checking && usernameCheck.available === true && (
                          <Check className="size-5 text-success" />
                        )}
                        {!usernameCheck.checking && usernameCheck.available === false && (
                          <X className="size-5 text-error" />
                        )}
                      </div>
                    </div>
                    
                    {/* Username Status Message */}
                    {usernameCheck.message && (
                      <p className={`text-xs mt-1 ${
                        usernameCheck.available ? 'text-success' : 'text-error'
                      }`}>
                        {usernameCheck.message}
                      </p>
                    )}
                    
                    {/* Username Suggestions */}
                    {usernameSuggestions.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-base-content/70 mb-2">Suggestions:</p>
                        <div className="flex flex-wrap gap-1">
                          {usernameSuggestions.map((suggestion) => (
                            <button
                              key={suggestion}
                              type="button"
                              onClick={() => selectSuggestion(suggestion)}
                              className="badge badge-outline hover:badge-primary cursor-pointer text-xs"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <p className="text-xs opacity-70 mt-1">
                      Letters, numbers, periods, and underscores. Up to 30 characters.
                    </p>
                  </div>

                  {/* EMAIL */}
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text">Email</span>
                    </label>
                    <input
                      type="email"
                      placeholder="john@gmail.com"
                      className="input input-bordered w-full"
                      value={signupData.email}
                      onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                      required
                    />
                  </div>
                  {/* PASSWORD */}
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text">Password</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="********"
                        className="input input-bordered w-full pr-10"
                        value={signupData.password}
                        onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                        required
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 flex items-center pr-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="size-5 opacity-70" />
                        ) : (
                          <Eye className="size-5 opacity-70" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs opacity-70 mt-1">
                      Password must be at least 6 characters long
                    </p>
                  </div>

                  <div className="form-control">
                    <label className="label cursor-pointer justify-start gap-2">
                      <input type="checkbox" className="checkbox checkbox-sm" required />
                      <span className="text-xs leading-tight">
                        I agree to the{" "}
                        <span className="text-primary hover:underline">terms of service</span> and{" "}
                        <span className="text-primary hover:underline">privacy policy</span>
                      </span>
                    </label>
                  </div>
                </div>

                <button className="btn btn-primary w-full" type="submit">
                  {isPending ? (
                    <>
                      <span className="loading loading-spinner loading-xs"></span>
                      Loading...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </button>

                <div className="text-center mt-4">
                  <p className="text-sm">
                    Already have an account?{" "}
                    <Link to="/login" className="text-primary hover:underline">
                      Sign in
                    </Link>
                  </p>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* SIGNUP FORM - RIGHT SIDE */}
        <div className="hidden lg:flex w-full lg:w-1/2 bg-primary/10 items-center justify-center">
          <div className="max-w-md p-8">
            {/* Illustration */}
            <div className="relative aspect-square max-w-sm mx-auto">
              <img src="/i.png" alt="Language connection illustration" className="w-full h-full" />
            </div>

            <div className="text-center space-y-3 mt-6">
              <h2 className="text-xl font-semibold">Connect with language partners worldwide</h2>
              <p className="opacity-70">
                Practice conversations, make friends, and improve your language skills together
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;