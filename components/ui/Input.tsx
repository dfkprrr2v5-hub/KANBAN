import { cn } from '@/lib/utils/cn';
import { forwardRef, InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'w-full px-3 py-2 font-mono text-sm',
          'bg-background-tertiary text-text-primary',
          'border-2 border-border-primary rounded-md',
          'placeholder:text-text-muted',
          'focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/50',
          'transition-colors duration-200',
          'hover:border-border-hover',
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
