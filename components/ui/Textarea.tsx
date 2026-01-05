import { cn } from '@/lib/utils/cn';
import { TextareaHTMLAttributes } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = ({ className, ...props }: TextareaProps) => {
  return (
    <textarea
      className={cn(
        'w-full px-3 py-2 font-mono text-sm',
        'bg-background-tertiary text-text-primary',
        'border-2 border-border-primary rounded-md',
        'placeholder:text-text-muted',
        'focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/50',
        'transition-colors duration-200',
        'hover:border-border-hover',
        'resize-vertical',
        className
      )}
      {...props}
    />
  );
};
