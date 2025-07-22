import { Link } from "react-router";
import { MessageCircle, Video, Clock, Wifi, WifiOff } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { formatDistanceToNow } from '../utils/dateUtils';
import { TECH_STACK_TO_ICON } from "../constants";
import { createVideoCall } from '../lib/api';
import { handleCallWindow } from '../utils/callUtils';
import toast from 'react-hot-toast';
import useAuthUser from '../hooks/useAuthUser';

const FriendCard = ({ friend }) => {
  const { 
    getUnreadCount, 
    getLastMessage, 
    isUserTyping, 
    isUserOnline,
    markAsRead,
    playSound,
    getActiveCall,
    isCallActive,
    endActiveCall
  } = useNotifications();

  const { authUser } = useAuthUser();

  const unreadCount = getUnreadCount(friend._id);
  const lastMessage = getLastMessage(friend._id);
  const typing = isUserTyping(friend._id);
  
  // Simple online status logic - use what was working before
  const online = isUserOnline(friend._id) || friend.isOnline;
  
  const activeCall = getActiveCall(friend._id);
  const hasActiveCall = isCallActive(friend._id);

  const handleChatClick = (e) => {
    // Don't prevent default behavior - let the Link navigate normally
    if (unreadCount > 0) {
      markAsRead(friend._id);
    }
    console.log(`Navigating to chat with ${friend.fullName} (ID: ${friend._id})`);
  };

  const formatLastSeen = (lastSeen) => {
    if (!lastSeen || online) return null; 
    
    try {
      const lastSeenDate = new Date(lastSeen);
      const now = new Date();
      const diffInMinutes = Math.floor((now - lastSeenDate) / (1000 * 60));
      
      if (diffInMinutes < 2) return 'Just now';
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
      
      const hours = Math.floor(diffInMinutes / 60);
      if (hours < 24) return `${hours}h ago`;
      
      return formatDistanceToNow(lastSeenDate, { addSuffix: true });
    } catch {
      return 'Recently';
    }
  };

  const handleVideoCall = async () => {
    try {
      if (!authUser) {
        toast.error('Please log in to start a video call.', {
          icon: '❌',
          duration: 3000,
        });
        return;
      }

      // Show loading toast
      const loadingToast = toast.loading(`Starting video call with ${friend.fullName}...`);
      
      try {
        // Use the new createVideoCall API
        const response = await createVideoCall(friend._id);
        
        // Dismiss loading toast and show success
        toast.dismiss(loadingToast);
        
        if (response.success) {
          toast.success(`Video call started! ${friend.fullName} has been notified.`, {
            icon: '📹',
            duration: 3000,
          });
          
          // Play notification sound
          playSound('success');
          
          // Open call page using enhanced window handling
          setTimeout(() => {
            const callWindow = handleCallWindow(response.callUrl);
            if (!callWindow) {
              // Fallback to regular window.open if popup is blocked
              window.open(response.callUrl, '_blank');
            }
          }, 500);
        } else {
          throw new Error(response.message || 'Failed to create video call');
        }

      } catch (apiError) {
        // Dismiss loading toast
        toast.dismiss(loadingToast);
        
        console.error('Video call creation failed:', apiError);
        toast.error(`Failed to start video call: ${apiError.message || 'Please try again.'}`, {
          icon: '❌',
          duration: 3000,
        });
        playSound('error');
      }

    } catch (error) {
      console.error('Error starting video call:', error);
      toast.error('Failed to start video call. Please try again.', {
        icon: '❌',
        duration: 3000,
      });
      playSound('error');
    }
  };

  const handleJoinCall = () => {
    if (activeCall && activeCall.callUrl) {
      toast.success(`Joining video call with ${friend.fullName}...`, {
        icon: '📹',
        duration: 2000,
      });
      
      playSound('success');
      
      // Open the call URL using enhanced window handling
      const callWindow = handleCallWindow(activeCall.callUrl);
      if (!callWindow) {
        // Fallback to regular window.open if popup is blocked
        window.open(activeCall.callUrl, '_blank');
      }
      
      // Optionally end the active call tracking after joining
      // endActiveCall(friend._id);
    }
  };

  const proficientTechs = Array.isArray(friend.proficientTechStack) ? friend.proficientTechStack : friend.proficientTechStack ? [friend.proficientTechStack] : [];
  const learningTechs = Array.isArray(friend.learningTechStack) ? friend.learningTechStack : friend.learningTechStack ? [friend.learningTechStack] : [];
  
  return (
    <div className={`card transition-all duration-300 relative ${
      hasActiveCall 
        ? 'bg-warning/20 hover:bg-warning/30 border-2 border-warning/50 animate-pulse' 
        : 'bg-base-200 hover:bg-base-300'
    }`}>
      {/* Active Call Badge */}
      {hasActiveCall && (
        <div className="absolute -top-2 -left-2 z-10">
          <div className="badge badge-warning badge-sm text-white font-bold animate-bounce">
            📹 CALL
          </div>
        </div>
      )}
      
      {/* Unread Message Badge */}
      {unreadCount > 0 && (
        <div className={`absolute -top-2 z-10 ${hasActiveCall ? '-right-2' : '-right-2'}`}>
          <div className="badge badge-error badge-sm text-white font-bold min-w-[1.5rem] h-6 animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </div>
        </div>
      )}

      <div className="card-body p-4">
        {/* USER INFO with Online Status */}
        <div className="flex items-center gap-3 mb-3">
          <div className="avatar relative size-12">
            <img src={friend.profilePic} alt={friend.fullName} className="rounded-full ring-2 ring-primary/20" />
            
            {/* Online Status Indicator */}
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-base-200 ${
              online ? 'bg-success animate-pulse' : 'bg-base-300'
            }`}>
              {online ? (
                <Wifi className="w-2 h-2 text-white m-auto mt-0.5" />
              ) : (
                <WifiOff className="w-2 h-2 text-base-content/50 m-auto mt-0.5" />
              )}
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{friend.fullName}</h3>
            <div className="flex items-center gap-1 mt-1">
              <div className={`w-2 h-2 rounded-full ${online ? 'bg-success' : 'bg-base-content/30'}`}></div>
              <span className="text-xs text-base-content/60">
                {online ? 'Online' : formatLastSeen(friend.lastSeen) ? `Last seen ${formatLastSeen(friend.lastSeen)}` : 'Offline'}
              </span>
            </div>
          </div>
        </div>

        {/* Last Message or Typing Indicator */}
        {(lastMessage || typing) && (
          <div className="mb-3 p-2 bg-base-100 rounded-lg">
            {typing ? (
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm text-primary font-medium">typing...</span>
              </div>
            ) : lastMessage ? (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-base-content/60">
                    {lastMessage.isCurrentUser ? 'You' : friend.fullName}
                  </span>
                  <span className="text-xs text-base-content/50">
                    {formatDistanceToNow(new Date(lastMessage.timestamp), { addSuffix: true })}
                  </span>
                </div>
                <p className={`text-sm truncate ${unreadCount > 0 ? 'font-semibold text-base-content' : 'text-base-content/80'}`}>
                  {lastMessage.text}
                </p>
              </div>
            ) : null}
          </div>
        )}

        <div className="space-y-2 mb-3">
          {/* Proficient Tech Stacks */}
          {proficientTechs.length > 0 && (
            <div className="flex flex-wrap gap-1">
              <span className="text-xs font-medium text-secondary">💻 Proficient:</span>
              {proficientTechs.slice(0, 3).map((tech) => (
                <span key={tech} className="badge badge-secondary badge-sm">
                  {getTechIcon(tech)}
                  {tech}
                </span>
              ))}
              {proficientTechs.length > 3 && (
                <span className="badge badge-secondary badge-sm">+{proficientTechs.length - 3}</span>
              )}
            </div>
          )}
          
          {/* Learning Tech Stacks */}
          {learningTechs.length > 0 && (
            <div className="flex flex-wrap gap-1">
              <span className="text-xs font-medium text-accent">📚 Learning:</span>
              {learningTechs.slice(0, 3).map((tech) => (
                <span key={tech} className="badge badge-outline badge-sm">
                  {getTechIcon(tech)}
                  {tech}
                </span>
              ))}
              {learningTechs.length > 3 && (
                <span className="badge badge-outline badge-sm">+{learningTechs.length - 3}</span>
              )}
            </div>
          )}
        </div>

        {/* Enhanced Action Buttons */}
        <div className="flex gap-2 mt-auto">
          <Link
            to={`/chat/${friend._id}`}
            onClick={handleChatClick}
            className={`btn btn-primary btn-sm flex-1 gap-2 ${
              unreadCount > 0 ? 'animate-pulse' : ''
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            <span className="hidden sm:inline">
              {unreadCount > 0 ? `Chat (${unreadCount})` : 'Chat'}
            </span>
            <span className="sm:hidden">
              {unreadCount > 0 ? unreadCount : 'Chat'}
            </span>
          </Link>

          {hasActiveCall ? (
            <button 
              onClick={handleJoinCall}
              className="btn btn-warning btn-sm gap-1 px-3 animate-pulse"
              title={`Join video call with ${friend.fullName}`}
            >
              <Video className="w-4 h-4" />
              <span className="hidden sm:inline">Join Call</span>
              <span className="sm:hidden">Join</span>
            </button>
          ) : (
            <button 
              onClick={handleVideoCall}
              className="btn btn-success btn-sm gap-1 px-3"
              title={`Start video call with ${friend.fullName}`}
            >
              <Video className="w-4 h-4" />
              <span className="hidden sm:inline">Video</span>
            </button>
          )}
        </div>

        {/* Quick Stats */}
        <div className="flex justify-between items-center mt-2 pt-2 border-t border-base-300">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-base-content/50" />
            <span className="text-xs text-base-content/60">
              Joined {formatDistanceToNow(new Date(friend.createdAt || Date.now()), { addSuffix: true })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default FriendCard;

export function getTechIcon(techStack) {
  if (!techStack) return null;

  const techLower = techStack.toLowerCase();
  const icon = TECH_STACK_TO_ICON[techLower];

  if (icon) {
    return (
      <span className="mr-1 inline-block">
        {icon}
      </span>
    );
  }
  return <span className="mr-1 inline-block">💻</span>; // Default tech icon
}
