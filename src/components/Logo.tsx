import React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ 
  variant = 'dark', 
  size = 'md',
  className 
}) => {
  const sizeClasses = {
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
      <div className={cn(
        'flex items-center justify-center rounded-xl font-bold',
        size === 'sm' && 'h-8 w-8 text-sm',
        size === 'md' && 'h-10 w-10 text-base',
        size === 'lg' && 'h-14 w-14 text-xl',
        variant === 'light' ? 'bg-primary-foreground text-primary' : 'bg-venture-blue text-primary-foreground'
      )}>
        V
      </div>
      <div className="flex flex-col leading-none">
        <span className={cn(
          'font-bold tracking-tight',
          sizeClasses[size],
          colorClasses[variant]
        )}>
          VENTURE
        </span>
        <span className={cn(
          'text-xs font-medium tracking-widest uppercase',
          variant === 'light' ? 'text-primary-foreground/70' : 'text-muted-foreground'
        )}>
          Soccer
        </span>
      </div>
    </div>
  );
};
