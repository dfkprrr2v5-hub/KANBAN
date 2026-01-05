import { cn } from '@/lib/utils/cn';
import { ReactNode } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

export const Button = ({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) => {
  return (
    <button
      className={cn(
        'font-mono font-semibold transition-all duration-200 rounded-md',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background-primary focus:ring-accent-primary',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        size === 'sm' && 'px-3 py-1 text-xs',
        size === 'md' && 'px-4 py-2 text-sm',
        size === 'lg' && 'px-6 py-3 text-base',
        variant === 'primary' && [
          'bg-accent-primary text-background-primary',
          'hover:bg-accent-hover active:scale-95',
          'hover:shadow-[0_0_20px_rgba(255,107,53,0.4)]',
        ],
        variant === 'ghost' && [
          'bg-transparent text-text-primary border border-border-primary',
          'hover:border-accent-primary hover:text-accent-primary',
          'hover:bg-background-tertiary/50',
        ],
        variant === 'danger' && [
          'bg-status-danger/20 text-status-danger border border-status-danger/30',
          'hover:bg-status-danger/30 hover:border-status-danger/50',
        ],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
