// Online status management service

class OnlineStatusService {
  constructor() {
    this.heartbeatInterval = null;
    this.isOnline = false;
    this.lastActivityTime = Date.now();
    this.isTabVisible = !document.hidden;
    this.isWindowFocused = document.hasFocus();
    
    // Update activity time on user interactions
    this.bindActivityListeners();
  }

  bindActivityListeners() {
    const events = [
      'mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 
      'touchmove', 'touchend', 'click', 'keydown'
    ];
    
    const updateActivity = () => {
      this.lastActivityTime = Date.now();
      // If user is active and was offline, bring them back online
      if (!this.isOnline && (this.isTabVisible && this.isWindowFocused)) {
        this.setOnline();
      }
    };

    events.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });
  }

  async setOnline() {
    if (this.isOnline) return;
    
    try {
      const response = await fetch('/api/users/online-status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ isOnline: true })
      });

      if (response.ok) {
        this.isOnline = true;
        this.startHeartbeat();
        console.log('✅ User set to online');
      } else {
        console.error('❌ Failed to set online status:', response.status);
      }
    } catch (error) {
      console.error('❌ Error setting online status:', error);
    }
  }

  async setOffline() {
    if (!this.isOnline) return;
    
    try {
      const response = await fetch('/api/users/online-status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ isOnline: false })
      });

      if (response.ok) {
        this.isOnline = false;
        this.stopHeartbeat();
        console.log('📴 User status set to offline');
      }
    } catch (error) {
      console.error('Error setting offline status:', error);
    }
  }

  startHeartbeat() {
    if (this.heartbeatInterval) return;
    
    // Send heartbeat every 60 seconds to maintain online status
    this.heartbeatInterval = setInterval(async () => {
      const now = Date.now();
      const timeSinceActivity = now - this.lastActivityTime;
      
      // If user has been inactive for more than 3 minutes OR tab is hidden for more than 1 minute, set offline
      const shouldGoOffline = timeSinceActivity > 3 * 60 * 1000 || 
                             (!this.isTabVisible && timeSinceActivity > 60 * 1000) ||
                             (!this.isWindowFocused && timeSinceActivity > 60 * 1000);
      
      if (shouldGoOffline) {
        await this.setOffline();
        return;
      }
      
      // Only send heartbeat if user is truly active (visible tab + focused window)
      if (this.isOnline && this.isTabVisible && this.isWindowFocused && timeSinceActivity < 60 * 1000) {
        try {
          await fetch('/api/users/last-seen', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          console.log('💓 Heartbeat: Confirmed online status');
        } catch (error) {
          console.error('Error updating online status:', error);
        }
      }
    }, 60000); // 1 minute interval
  }

  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // Handle page visibility change
  handleVisibilityChange() {
    this.isTabVisible = !document.hidden;
    
    if (document.hidden) {
      console.log('📱 Tab hidden - user might be switching tabs');
      // Don't immediately set offline, just mark tab as hidden
      // Let the heartbeat handle offline status after longer inactivity
    } else {
      console.log('📱 Tab visible - user is back');
      this.lastActivityTime = Date.now(); // Reset activity time
      if (!this.isOnline) {
        this.setOnline();
      }
    }
  }

  // Handle window focus/blur
  handleFocusChange() {
    this.isWindowFocused = document.hasFocus();
    
    if (this.isWindowFocused) {
      console.log('🔍 Window focused - user is back');
      this.lastActivityTime = Date.now();
      if (!this.isOnline) {
        this.setOnline();
      }
    } else {
      console.log('🔍 Window blurred - user might be away');
      // Don't immediately set offline, let heartbeat handle it
    }
  }

  // Initialize the service
  init() {
    this.setOnline();
    
    // Handle page visibility
    document.addEventListener('visibilitychange', () => {
      this.handleVisibilityChange();
    });

    // Handle page unload - definitely set offline
    window.addEventListener('beforeunload', () => {
      this.setOffline();
    });

    // Handle window focus/blur
    window.addEventListener('focus', () => {
      this.handleFocusChange();
    });

    window.addEventListener('blur', () => {
      this.handleFocusChange();
    });

    // Handle mobile app state changes
    if ('onvisibilitychange' in document) {
      document.addEventListener('visibilitychange', () => {
        this.handleVisibilityChange();
      });
    }
  }

  // Cleanup
  destroy() {
    this.stopHeartbeat();
    this.setOffline();
  }
}

export default OnlineStatusService;
