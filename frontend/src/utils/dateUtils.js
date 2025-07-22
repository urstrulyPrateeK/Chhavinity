// Simple date utility without external dependencies
export const formatDistanceToNow = (date, options = {}) => {
  const now = new Date();
  const diffInMs = now - new Date(date);
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) {
    return 'just now';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}m${options.addSuffix ? ' ago' : ''}`;
  } else if (diffInHours < 24) {
    return `${diffInHours}h${options.addSuffix ? ' ago' : ''}`;
  } else if (diffInDays < 7) {
    return `${diffInDays}d${options.addSuffix ? ' ago' : ''}`;
  } else {
    const weeks = Math.floor(diffInDays / 7);
    return `${weeks}w${options.addSuffix ? ' ago' : ''}`;
  }
};

export const formatTime = (date) => {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
};
