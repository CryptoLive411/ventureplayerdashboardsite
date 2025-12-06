import React from 'react';
import { cn } from '@/lib/utils';
import ventureLogo from '@/assets/venture-logo.png';

interface LogoProps {
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ 
  variant = 'dark', 
  size = 'md',
  className,
  showText = true
}) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-14 w-14',
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
  };

  const colorClasses = {
    light: 'text-primary-foreground',
    dark: 'text-primary',
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <img 
        src={ventureLogo} 
        alt="Venture Sports" 
        className={cn(sizeClasses[size], 'rounded-full object-contain')}
      />
      {showText && (
        <div className="flex flex-col leading-none">
          <span className={cn(
            'font-bold tracking-tight',
            textSizeClasses[size],
            colorClasses[variant]
          )}>
            VENTURE
          </span>
          <span className={cn(
            'text-xs font-medium tracking-widest uppercase',
            variant === 'light' ? 'text-primary-foreground/70' : 'text-muted-foreground'
          )}>
            Sports
          </span>
        </div>
      )}
    </div>
  );
};
