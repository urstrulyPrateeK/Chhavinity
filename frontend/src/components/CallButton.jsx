import { VideoIcon, Phone } from "lucide-react";

function CallButton({ handleVideoCall }) {
  return (
    <button 
      onClick={handleVideoCall} 
      className="btn btn-success btn-sm sm:btn-md gap-1 sm:gap-2 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 bg-gradient-to-r from-success to-success/90 border-none min-h-[44px] min-w-[44px] px-2 sm:px-3"
      title="Start Video Call"
    >
      <VideoIcon className="size-4 sm:size-5" />
      <span className="hidden md:inline text-xs sm:text-sm font-medium">Video Call</span>
      <span className="sm:hidden md:hidden text-xs">Call</span>
    </button>
  );
}

export default CallButton;
