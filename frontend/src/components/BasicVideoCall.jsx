import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router';
import toast from 'react-hot-toast';

const BasicVideoCall = () => {
  const { id: callId } = useParams();
  const [localStream, setLocalStream] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  
  const localVideoRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    initializeCall();
    
    return () => {
      cleanup();
    };
  }, []);

  const initializeCall = async () => {
    try {
      console.log("Initializing video call...");
      
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      console.log("Got user media stream");
      setLocalStream(stream);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      setIsConnected(true);
      setIsInitializing(false);
      toast.success('Video call ready! Camera and microphone are working.');

    } catch (error) {
      console.error('Error accessing media devices:', error);
      setIsInitializing(false);
      
      if (error.name === 'NotAllowedError') {
        toast.error('Camera/microphone access denied. Please allow permissions and refresh.');
      } else if (error.name === 'NotFoundError') {
        toast.error('No camera or microphone found. Please connect devices and refresh.');
      } else {
        toast.error('Could not access camera/microphone. Please check your devices.');
      }
    }
  };

  const toggleMute = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
        toast.success(audioTrack.enabled ? 'Microphone unmuted' : 'Microphone muted');
      }
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
        toast.success(videoTrack.enabled ? 'Camera turned on' : 'Camera turned off');
      }
    }
  };

  const endCall = () => {
    cleanup();
    toast.success('Call ended');
    
    // Check if this is a popup window
    if (window.opener) {
      setTimeout(() => {
        window.close();
      }, 1000);
    } else {
      setTimeout(() => {
        navigate('/');
      }, 1000);
    }
  };

  const cleanup = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => {
        track.stop();
        console.log('Stopped track:', track.kind);
      });
    }
  };

  if (isInitializing) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="loading loading-spinner loading-lg"></div>
          <p className="text-xl">Setting up video call...</p>
          <p className="text-sm opacity-70">Please allow camera and microphone access</p>
          <p className="text-xs opacity-50">Call ID: {callId}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {/* Video Area */}
      <div className="flex-1 relative">
        {/* Local Video - Full Screen */}
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
          style={{ transform: 'scaleX(-1)' }} // Mirror effect
        />
        
        {/* Call Info Overlay */}
        <div className="absolute top-4 left-4 bg-black bg-opacity-50 rounded-lg p-3 text-white">
          <p className="text-sm font-semibold">Video Call Ready</p>
          <p className="text-xs opacity-70">ID: {callId}</p>
          <p className="text-xs opacity-70">
            Status: {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
          </p>
        </div>

        {/* Connection Status */}
        {isConnected && (
          <div className="absolute top-4 right-4 bg-green-600 bg-opacity-80 rounded-lg p-2 text-white">
            <p className="text-sm">✅ Camera & Mic Working</p>
          </div>
        )}

        {/* Video Off Overlay */}
        {isVideoOff && (
          <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="text-6xl mb-4">📹</div>
              <p className="text-xl">Camera is off</p>
            </div>
          </div>
        )}

        {/* Muted Indicator */}
        {isMuted && (
          <div className="absolute bottom-20 left-4 bg-red-600 bg-opacity-80 rounded-full p-2">
            <span className="text-white text-lg">🔇</span>
          </div>
        )}
      </div>

      {/* Call Controls */}
      <div className="flex justify-center items-center gap-6 p-6 bg-gray-800">
        <button
          onClick={toggleMute}
          className={`btn btn-circle btn-lg ${isMuted ? 'btn-error' : 'btn-success'}`}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          <span className="text-xl">
            {isMuted ? '🔇' : '🎤'}
          </span>
        </button>
        
        <button
          onClick={toggleVideo}
          className={`btn btn-circle btn-lg ${isVideoOff ? 'btn-error' : 'btn-success'}`}
          title={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
        >
          <span className="text-xl">
            {isVideoOff ? '📹' : '📷'}
          </span>
        </button>
        
        <button
          onClick={endCall}
          className="btn btn-error btn-circle btn-lg"
          title="End call"
        >
          <span className="text-xl">📞</span>
        </button>
      </div>

      {/* Instructions */}
      <div className="bg-gray-700 p-4 text-center text-white">
        <p className="text-sm">
          📱 Video call is working! Share this URL with others to join: 
          <br />
          <code className="bg-gray-600 px-2 py-1 rounded text-xs">
            {window.location.href}
          </code>
        </p>
      </div>
    </div>
  );
};

export default BasicVideoCall;
