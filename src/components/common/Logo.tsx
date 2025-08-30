import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'brand';
  variant?: 'full' | 'icon' | 'auto';
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  variant = 'auto',
  className = ''
}) => {
  const { theme } = useTheme();
  
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
    brand: 'w-[150px] h-auto'
  };

  // Auto variant uses full logo for light mode, icon for dark mode
  const getLogoSrc = () => {
    if (variant === 'full') {
      return '/lovable-uploads/192a7374-3ce6-482b-aaad-9a66d287e7fa.png';
    }
    if (variant === 'icon') {
      return '/lovable-uploads/0de19fef-a42f-4f74-805c-75b39f991ab4.png';
    }
    // Auto mode: full logo for light, icon for dark
    return theme === 'dark' 
      ? '/lovable-uploads/0de19fef-a42f-4f74-805c-75b39f991ab4.png'
      : '/lovable-uploads/192a7374-3ce6-482b-aaad-9a66d287e7fa.png';
  };

  const getAltText = () => {
    return variant === 'icon' || (variant === 'auto' && theme === 'dark')
      ? 'Secure Retire Icon'
      : 'Secure Retire Logo';
  };

  return (
    <div className={`${sizeClasses[size]} ${className} relative flex items-center justify-center`}>
      <img 
        src={getLogoSrc()} 
        alt={getAltText()} 
        className="w-full h-full object-contain"
      />
    </div>
  );
};