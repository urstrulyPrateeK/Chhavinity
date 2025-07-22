// Simple call window handler for popup windows
export const handleCallWindow = (callUrl) => {
  // Open call in new window with specific features
  const callWindow = window.open(
    callUrl,
    'videoCall',
    'width=1200,height=800,scrollbars=no,resizable=yes,status=no,toolbar=no,menubar=no,location=no'
  );

  if (callWindow) {
    // Focus the new window
    callWindow.focus();
    
    // Monitor if the window is closed
    const checkClosed = setInterval(() => {
      if (callWindow.closed) {
        clearInterval(checkClosed);
        console.log('Call window was closed');
        // Could trigger additional cleanup here
      }
    }, 1000);
    
    return callWindow;
  } else {
    console.error('Could not open call window - popup blocked?');
    return null;
  }
};

// Enhanced call URL helper
export const generateCallUrl = (callId, baseUrl = window.location.origin) => {
  return `${baseUrl}/call/${callId}?popup=true`;
};
