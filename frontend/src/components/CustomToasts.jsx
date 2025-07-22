import toast from 'react-hot-toast';
import { MessageCircle, X, Video, Phone } from 'lucide-react';

// Custom toast component for video call notifications
export const VideoCallToast = ({ senderName, callUrl, senderPic, onJoin, onDismiss }) => (
  <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-success/20 to-primary/20 rounded-lg shadow-lg border-2 border-success/40 max-w-sm animate-pulse">
    {/* Profile Picture with Call Icon */}
    <div className="avatar relative">
      <div className="w-12 h-12 rounded-full ring-2 ring-success">
        <img src={senderPic || '/icons/icon-96x96.png'} alt={senderName} />
      </div>
      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-success rounded-full flex items-center justify-center">
        <Video className="w-3 h-3 text-white" />
      </div>
    </div>
    
    {/* Call Content */}
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-sm text-success truncate">📹 Video Call</h4>
        <button 
          onClick={onDismiss}
          className="btn btn-ghost btn-xs btn-circle"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
      <p className="text-sm font-medium text-base-content truncate mt-1">{senderName} is calling...</p>
      
      {/* Action Buttons */}
      <div className="flex gap-2 mt-3">
        <button 
          onClick={onJoin}
          className="btn btn-success btn-sm gap-2 flex-1 animate-bounce"
        >
          <Video className="w-4 h-4" />
          Join Call
        </button>
        <button 
          onClick={onDismiss}
          className="btn btn-outline btn-sm gap-1"
        >
          <Phone className="w-3 h-3 rotate-45" />
          Decline
        </button>
      </div>
    </div>
  </div>
);

// Custom toast component for message notifications
export const MessageToast = ({ senderName, message, senderPic, onReply, onDismiss }) => (
  <div className="flex items-center gap-3 p-3 bg-base-200 rounded-lg shadow-lg border border-primary/20 max-w-sm">
    {/* Profile Picture */}
    <div className="avatar">
      <div className="w-10 h-10 rounded-full">
        <img src={senderPic || '/icons/icon-96x96.png'} alt={senderName} />
      </div>
    </div>
    
    {/* Message Content */}
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-sm text-primary truncate">{senderName}</h4>
        <button 
          onClick={onDismiss}
          className="btn btn-ghost btn-xs btn-circle"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
      <p className="text-xs text-base-content/80 truncate mt-1">{message}</p>
      
      {/* Action Buttons */}
      <div className="flex gap-2 mt-2">
        <button 
          onClick={onReply}
          className="btn btn-primary btn-xs gap-1"
        >
          <MessageCircle className="w-3 h-3" />
          Reply
        </button>
      </div>
    </div>
  </div>
);

// Enhanced toast functions
export const showMessageToast = (senderName, message, senderPic, onReply = () => {}) => {
  const toastId = toast.custom(
    (t) => (
      <MessageToast
        senderName={senderName}
        message={message.length > 30 ? message.substring(0, 27) + '...' : message}
        senderPic={senderPic}
        onReply={() => {
          toast.dismiss(t.id);
          onReply();
        }}
        onDismiss={() => toast.dismiss(t.id)}
      />
    ),
    {
      duration: 4000,
      position: 'top-right',
      id: `message-${senderName}-${Date.now()}`,
    }
  );
  
  return toastId;
};

// Video call toast function
export const showVideoCallToast = (senderName, callUrl, senderPic, onJoin = () => {}) => {
  const toastId = toast.custom(
    (t) => (
      <VideoCallToast
        senderName={senderName}
        callUrl={callUrl}
        senderPic={senderPic}
        onJoin={() => {
          toast.dismiss(t.id);
          onJoin();
        }}
        onDismiss={() => toast.dismiss(t.id)}
      />
    ),
    {
      duration: 10000, // Longer duration for video calls
      position: 'top-center',
      id: `video-call-${senderName}-${Date.now()}`,
    }
  );
  
  return toastId;
};

export const showFriendRequestToast = (senderName, senderPic, onAccept = () => {}, onDecline = () => {}) => {
  const toastId = toast.custom(
    (t) => (
      <div className="flex items-center gap-3 p-3 bg-base-200 rounded-lg shadow-lg border border-success/20 max-w-sm">
        <div className="avatar">
          <div className="w-10 h-10 rounded-full">
            <img src={senderPic || '/icons/icon-96x96.png'} alt={senderName} />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm text-success">{senderName}</h4>
            <button 
              onClick={() => toast.dismiss(t.id)}
              className="btn btn-ghost btn-xs btn-circle"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          <p className="text-xs text-base-content/80 mt-1">wants to be your friend</p>
          
          <div className="flex gap-2 mt-2">
            <button 
              onClick={() => {
                toast.dismiss(t.id);
                onAccept();
              }}
              className="btn btn-success btn-xs"
            >
              Accept
            </button>
            <button 
              onClick={() => {
                toast.dismiss(t.id);
                onDecline();
              }}
              className="btn btn-ghost btn-xs"
            >
              Decline
            </button>
          </div>
        </div>
      </div>
    ),
    {
      duration: 6000,
      position: 'top-right',
      id: `friend-request-${senderName}`,
    }
  );
  
  return toastId;
};
