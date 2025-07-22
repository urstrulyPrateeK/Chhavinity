// Sound generation script for notifications
// You can use this to generate sounds or replace with actual audio files

const generateNotificationSounds = () => {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  
  const createTone = (frequency, duration, type = 'sine') => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  };

  return {
    playMessageSound: () => {
      createTone(800, 0.2);
      setTimeout(() => createTone(600, 0.2), 100);
    },
    
    playTypingSound: () => {
      createTone(400, 0.1, 'square');
    },
    
    playNotificationSound: () => {
      createTone(523, 0.3); // C note
      setTimeout(() => createTone(659, 0.3), 150); // E note
      setTimeout(() => createTone(784, 0.4), 300); // G note
    }
  };
};

// Usage: const sounds = generateNotificationSounds();
// sounds.playMessageSound();

export default generateNotificationSounds;
