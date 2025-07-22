import { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const isAppInstalled = window.matchMedia('(display-mode: standalone)').matches || 
                          window.navigator.standalone === true;
    setIsInstalled(isAppInstalled);

    // Detect device type
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    const isAndroidDevice = /android/.test(userAgent);
    
    setIsIOS(isIOSDevice);
    setIsAndroid(isAndroidDevice);

    // Only show install prompt on mobile devices and if not already installed
    const isMobile = isIOSDevice || isAndroidDevice || window.innerWidth <= 768;
    
    if (!isAppInstalled && isMobile) {
      // For Android - listen for beforeinstallprompt
      const handleBeforeInstallPrompt = (e) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setShowInstallPrompt(true);
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

      // For iOS - show manual install instructions after a delay
      if (isIOSDevice) {
        const timer = setTimeout(() => {
          setShowInstallPrompt(true);
        }, 3000);
        return () => clearTimeout(timer);
      }

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      };
    }
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Android installation
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setShowInstallPrompt(false);
      }
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    setDeferredPrompt(null);
    
    // Don't show again for this session
    sessionStorage.setItem('installPromptDismissed', 'true');
  };

  // Don't show if already installed or dismissed this session
  if (isInstalled || 
      sessionStorage.getItem('installPromptDismissed') || 
      !showInstallPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
      <div className="bg-gradient-to-r from-primary to-secondary p-4 rounded-2xl shadow-2xl border border-primary/20 backdrop-blur-sm">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Smartphone className="size-5 text-white" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-bold text-sm mb-1">
              Install Chhavinity
            </h3>
            <p className="text-white/90 text-xs mb-3 leading-relaxed">
              {isIOS 
                ? "Add to your home screen for the best experience! Tap the share button and select 'Add to Home Screen'."
                : "Install our app for a better experience with offline access and notifications."
              }
            </p>
            
            <div className="flex gap-2">
              {!isIOS && deferredPrompt && (
                <button
                  onClick={handleInstallClick}
                  className="btn btn-sm bg-white/20 hover:bg-white/30 text-white border-white/30 flex-1"
                >
                  <Download className="size-4 mr-1" />
                  Install
                </button>
              )}
              
              <button
                onClick={handleDismiss}
                className="btn btn-sm btn-ghost text-white/80 hover:text-white hover:bg-white/10"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>
        </div>
        
        {/* iOS specific instructions */}
        {isIOS && (
          <div className="mt-3 pt-3 border-t border-white/20">
            <div className="flex items-center gap-2 text-white/90 text-xs">
              <span>1. Tap</span>
              <div className="w-4 h-4 bg-white/30 rounded flex items-center justify-center">
                <span className="text-[10px]">⬆️</span>
              </div>
              <span>2. Select "Add to Home Screen"</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
