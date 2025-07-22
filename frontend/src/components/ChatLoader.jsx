import { LoaderIcon, MessageCircle } from "lucide-react";
import ChhavimityLogo from "./ChhavimityLogo";

function ChatLoader() {
  return (
    <div className="h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-base-100 to-base-200">
      <div className="bg-base-100 rounded-2xl p-8 shadow-2xl border border-base-300 max-w-md w-full text-center">
        {/* Animated Logo */}
        <div className="mb-6">
          <ChhavimityLogo size="xl" animate={true} />
        </div>
        
        {/* Loading Animation */}
        <div className="flex items-center justify-center mb-4">
          <LoaderIcon className="animate-spin size-8 text-primary mr-3" />
          <MessageCircle className="size-6 text-secondary animate-pulse" />
        </div>
        
        {/* Loading Text */}
        <h3 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
          Connecting to Chat
        </h3>
        <p className="text-base-content/70 text-sm">
          Setting up secure connection...
        </p>
        
        {/* Progress Dots */}
        <div className="flex justify-center gap-1 mt-6">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-secondary rounded-full animate-bounce delay-75"></div>
          <div className="w-2 h-2 bg-accent rounded-full animate-bounce delay-150"></div>
        </div>
      </div>
    </div>
  );
}

export default ChatLoader;
