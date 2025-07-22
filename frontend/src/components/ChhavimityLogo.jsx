import React from 'react';

const ChhavimityLogo = ({ 
  size = 'md', 
  showText = true, 
  className = '',
  animate = true,
  textSize = null 
}) => {
  // Size configurations
  const sizeClasses = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6', 
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-12 h-12',
    '2xl': 'w-16 h-16'
  };

  const textSizeClasses = {
    xs: 'text-sm',
    sm: 'text-base',
    md: 'text-xl', 
    lg: 'text-2xl',
    xl: 'text-3xl',
    '2xl': 'text-4xl'
  };

  const logoSize = sizeClasses[size] || sizeClasses.md;
  const defaultTextSize = textSizeClasses[size] || textSizeClasses.md;
  const finalTextSize = textSize || defaultTextSize;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Custom Chhavinity Logo SVG */}
      <div className={`${logoSize} relative flex items-center justify-center`}>
        <svg
          viewBox="0 0 40 40"
          className={`w-full h-full ${animate ? 'animate-pulse' : ''}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer ring with gradient */}
          <circle
            cx="20"
            cy="20"
            r="18"
            stroke="url(#gradient1)"
            strokeWidth="2"
            fill="none"
          />
          
          {/* Inner decorative elements */}
          <circle
            cx="20"
            cy="20"
            r="12"
            fill="url(#gradient2)"
            opacity="0.8"
          />
          
          {/* Central 'C' for Chhavinity */}
          <path
            d="M15 12 Q12 12 12 15 L12 25 Q12 28 15 28 Q18 28 18 25"
            stroke="white"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
          
          {/* Small decorative dots */}
          <circle cx="26" cy="14" r="1.5" fill="url(#gradient1)" />
          <circle cx="28" cy="20" r="1" fill="url(#gradient1)" />
          <circle cx="26" cy="26" r="1.5" fill="url(#gradient1)" />
          
          {/* Gradient definitions */}
          <defs>
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--p))" />
              <stop offset="50%" stopColor="hsl(var(--s))" />
              <stop offset="100%" stopColor="hsl(var(--a))" />
            </linearGradient>
            <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--p))" stopOpacity="0.3" />
              <stop offset="100%" stopColor="hsl(var(--s))" stopOpacity="0.6" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* App name */}
      {showText && (
        <span className={`font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent tracking-wider ${finalTextSize}`}>
          Chhavinity
        </span>
      )}
    </div>
  );
};

export default ChhavimityLogo;
